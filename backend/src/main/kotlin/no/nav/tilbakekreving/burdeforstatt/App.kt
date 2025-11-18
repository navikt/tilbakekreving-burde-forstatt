package no.nav.tilbakekreving.burdeforstatt

import com.fasterxml.jackson.core.util.DefaultIndenter
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.ktor.client.HttpClient
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.jackson.JacksonConverter
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.install
import io.ktor.server.application.log
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.authentication
import io.ktor.server.auth.principal
import io.ktor.server.engine.addShutdownHook
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondRedirect
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import no.nav.tilbakekreving.burdeforstatt.auth.AuthClient
import no.nav.tilbakekreving.burdeforstatt.auth.TexasAuthenticationProvider
import no.nav.tilbakekreving.burdeforstatt.auth.TexasPrincipal
import no.nav.tilbakekreving.burdeforstatt.auth.TokenResponse
import no.nav.tilbakekreving.burdeforstatt.config.AppConfig
import no.nav.tilbakekreving.burdeforstatt.config.KafkaConfig
import no.nav.tilbakekreving.burdeforstatt.config.MqConfig
import no.nav.tilbakekreving.burdeforstatt.kontrakter.Ressurs
import no.nav.tilbakekreving.burdeforstatt.modell.RequestFraBurdeForstatt
import no.nav.tilbakekreving.burdeforstatt.service.FagsystemKafkaConsumer
import no.nav.tilbakekreving.burdeforstatt.service.MQService
import no.nav.tilbakekreving.burdeforstatt.service.TilbakekrevingService

val objectMapper: ObjectMapper =
    jacksonObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        .configure(SerializationFeature.INDENT_OUTPUT, true)
        .setDefaultPrettyPrinter(
            DefaultPrettyPrinter().apply {
                indentArraysWith(DefaultPrettyPrinter.FixedSpaceIndenter.instance)
                indentObjectsWith(DefaultIndenter("  ", "\n"))
            },
        )
        .registerModule(JavaTimeModule())

fun main() {
    val httpClient = defaultHttpClient()
    val appConfig =
        AppConfig(
            tokenEndpoint = System.getenv("NAIS_TOKEN_ENDPOINT") ?: "http://localhost:4001/api/v1/token",
            tokenExchangeEndpoint =
                System.getenv("NAIS_TOKEN_EXCHANGE_ENDPOINT")
                    ?: "http://localhost:4001/api/v1/token/exchange",
            tokenIntrospectionEndpoint =
                System.getenv("NAIS_TOKEN_INTROSPECTION_ENDPOINT")
                    ?: "http://localhost:4001/api/v1/introspect",
            loginRedirectUrl = System.getenv("POST_LOGIN_REDIRECT_URL") ?: "http://localhost:5173/",
        )

    val mqConfig =
        MqConfig(
            host = "b27apvl220.preprod.local",
            port = 1413,
            channel = "Q1_FAMILIE_TILBAKE",
            queueManager = "MQLS02",
            user = System.getenv("CREDENTIAL_USERNAME") ?: "username",
            password = System.getenv("CREDENTIAL_PASSWORD") ?: "password",
        )

    val kafkaConfig =
        KafkaConfig(
            kafkaBrokers = System.getenv("KAFKA_BROKERS"),
            keystorePath = System.getenv("KAFKA_KEYSTORE_PATH"),
            truststorePath = System.getenv("KAFKA_TRUSTSTORE_PATH"),
            credstorePassword = System.getenv("KAFKA_CREDSTORE_PASSWORD"),
        )

    val fagsystemKafkaConsumer =
        FagsystemKafkaConsumer(
            kafkaConsumer = kafkaConfig.createConsumer(),
            kafkaProducer = kafkaConfig.createProducer(),
        )
    val mqService = MQService(mqConfig)

    Thread(fagsystemKafkaConsumer).start()
    val server =
        embeddedServer(Netty, port = 8080) {
            install(ContentNegotiation) {
                register(ContentType.Application.Json, JacksonConverter(objectMapper))
            }
            registerApiRoutes(appConfig, httpClient, mqService)
        }
    server.addShutdownHook { fagsystemKafkaConsumer.stop() }
    server.start(wait = true)
}

private fun Application.registerApiRoutes(
    appConfig: AppConfig,
    httpClient: HttpClient,
    mqService: MQService,
) {
    val authClient =
        AuthClient(
            appConfig = appConfig,
            httpClient = httpClient,
        )
    authentication {
        register(TexasAuthenticationProvider(TexasAuthenticationProvider.Config("azuread", authClient)))
    }

    var tilbakekrevingUrl = "http://tilbakekreving-backend"
    val scope = "api://dev-gcp.tilbake.tilbakekreving-backend/.default"

    routing {
        get("/liveness") {
            call.respondText("OK")
        }
        get("/readiness") {
            call.respondText("OK")
        }
        authenticate("azuread") {
            route("/api") {
                get("/me") {
                    call.respond(jacksonObjectMapper().writeValueAsString(call.principal<TexasPrincipal>()!!.userinfo))
                }
                post("/tilbakekreving") {
                    val principal = call.principal<TexasPrincipal>()
                    val navIdent = principal?.userinfo?.ident
                    if (navIdent == null) {
                        log.error("Kunne ikke hente NAVident.")
                        call.respond(HttpStatusCode.Unauthorized, "Kunne ikke hente NAVident")
                        return@post
                    }

                    when (val tokenResponse = authClient.token(scope)) {
                        is TokenResponse.Success ->
                            handleSuccess(
                                httpClient,
                                mqService,
                                tilbakekrevingUrl,
                                call,
                                tokenResponse.accessToken,
                                navIdent,
                            )
                        is TokenResponse.Error -> {
                            log.error("Kunne ikke hente systemtoken: ${tokenResponse.error}, Status: ${tokenResponse.status}")
                            handleError(call, tokenResponse)
                        }
                    }
                }
                get("/redirect") {
                    call.respondRedirect(appConfig.loginRedirectUrl)
                }
            }
        }
    }
}

private suspend fun handleSuccess(
    httpClient: HttpClient,
    mqService: MQService,
    tilbakekrevingUrl: String,
    call: ApplicationCall,
    accessToken: String,
    navIdent: String,
) {
    val requestFraBurdeForstatt = call.receive<RequestFraBurdeForstatt>()
    val tilbakekrevingService = TilbakekrevingService(httpClient, mqService, tilbakekrevingUrl, accessToken, navIdent)
    val respons = tilbakekrevingService.opprettBehandlingOgKravgrunnlagITilbakekreving(requestFraBurdeForstatt)

    val status = if (respons.status == Ressurs.Status.SUKSESS) HttpStatusCode.OK else HttpStatusCode.InternalServerError
    call.respond(status, respons)
}

private suspend fun handleError(
    call: ApplicationCall,
    tokenResponse: TokenResponse.Error,
) {
    call.respond(HttpStatusCode.Unauthorized, "Kunne ikke hente systemtoken: ${tokenResponse.error}, Status: ${tokenResponse.status}")
}
