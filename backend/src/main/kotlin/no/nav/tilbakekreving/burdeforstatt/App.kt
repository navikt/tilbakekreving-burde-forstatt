package no.nav.tilbakekreving.burdeforstatt

import com.fasterxml.jackson.core.util.DefaultIndenter
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import io.ktor.client.*
import io.ktor.http.*
import io.ktor.serialization.jackson.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import no.nav.tilbakekreving.burdeforstatt.auth.AuthClient
import no.nav.tilbakekreving.burdeforstatt.auth.TexasAuthenticationProvider
import no.nav.tilbakekreving.burdeforstatt.auth.TexasPrincipal
import no.nav.tilbakekreving.burdeforstatt.auth.TokenResponse
import no.nav.tilbakekreving.burdeforstatt.config.AppConfig
import no.nav.tilbakekreving.burdeforstatt.config.MqConfig
import no.nav.tilbakekreving.burdeforstatt.service.MQService
import no.nav.tilbakekreving.burdeforstatt.kontrakter.*
import no.nav.tilbakekreving.burdeforstatt.modell.RequestFraBurdeForstatt
import no.nav.tilbakekreving.burdeforstatt.service.SendTilTilbakekreving

fun main() {

    val httpClient = defaultHttpClient()


       val appConfig = AppConfig(
            tokenEndpoint = System.getenv("NAIS_TOKEN_ENDPOINT") ?: "http://localhost:4001/api/v1/token",
            tokenExchangeEndpoint = System.getenv("NAIS_TOKEN_EXCHANGE_ENDPOINT") ?: "http://localhost:4001/api/v1/token/exchange",
            tokenIntrospectionEndpoint = System.getenv("NAIS_TOKEN_INTROSPECTION_ENDPOINT") ?: "http://localhost:4001/api/v1/introspect",
            loginRedirectUrl = System.getenv("POST_LOGIN_REDIRECT_URL") ?: "http://localhost:5173/",
        )

        val mqConfig = MqConfig(
            host = "b27apvl220.preprod.local",
            port = 1413,
            channel = "Q1_FAMILIE_TILBAKE",
            queueManager = "MQLS02",
            queue = "QA.Q1_FAMILIE_TILBAKE.KRAVGRUNNLAG",
            user = System.getenv("CREDENTIAL_USERNAME"),
            password = System.getenv("CREDENTIAL_PASSWORD"),
        )

    val mqService = MQService(mqConfig)

    embeddedServer(Netty, port = 8080) {
        install(ContentNegotiation) {
            jackson {
                configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                configure(SerializationFeature.INDENT_OUTPUT, true)
                setDefaultPrettyPrinter(DefaultPrettyPrinter().apply {
                    indentArraysWith(DefaultPrettyPrinter.FixedSpaceIndenter.instance)
                    indentObjectsWith(DefaultIndenter("  ", "\n"))
                })
                registerModule(JavaTimeModule())  // support java.time.* types
            }
        }
        registerApiRoutes(appConfig, httpClient, mqService)
    }.start(wait = true)

}

private fun Application.registerApiRoutes(appConfig: AppConfig, httpClient: HttpClient, mqService: MQService) {
    val authClient = AuthClient(
        appConfig = appConfig,
        httpClient = httpClient
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
                    call.respondText(call.principal<TexasPrincipal>()!!.claims.toString())

                }
                post("/tilbakekreving") {
                    val principal = call.principal<TexasPrincipal>()
                    val claims = principal?.claims
                    val navIdent: String = (claims?.get("NAVident") ?: "Claim not found").toString()

                    val tokenResponse = authClient.token(scope)
                    val accessToken = when (tokenResponse) {
                        is TokenResponse.Success -> tokenResponse.accessToken
                        is TokenResponse.Error -> {
                            log.error("Kunne ikke hente systemtoken: ${tokenResponse.error}, Status: ${tokenResponse.status}")
                            null
                        }
                    }

                    val requestFraBurdeForstatt = call.receive<RequestFraBurdeForstatt>()
                    val sendTilTilbakekreving = SendTilTilbakekreving(httpClient, mqService, tilbakekrevingUrl, accessToken, navIdent)
                    val respons = sendTilTilbakekreving.process(requestFraBurdeForstatt)
                    if (respons.status == Ressurs.Status.SUKSESS) {
                        call.respond(
                            HttpStatusCode.OK,
                            respons
                        )
                    } else {
                        call.respond(
                            HttpStatusCode.InternalServerError,
                            respons
                        )
                    }
                }
                get("/redirect") {
                    call.respondRedirect(appConfig.loginRedirectUrl)
                }
            }
        }
    }
}
