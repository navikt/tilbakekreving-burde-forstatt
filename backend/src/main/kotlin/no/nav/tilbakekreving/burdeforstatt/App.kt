package no.nav.tilbakekreving.burdeforstatt

import io.ktor.client.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import no.nav.tilbakekreving.burdeforstatt.auth.AuthClient
import no.nav.tilbakekreving.burdeforstatt.auth.TexasAuthenticationProvider
import no.nav.tilbakekreving.burdeforstatt.auth.TexasPrincipal
import no.nav.tilbakekreving.burdeforstatt.config.AppConfig
import no.nav.tilbakekreving.burdeforstatt.config.MqConfig
import no.nav.tilbakekreving.burdeforstatt.service.MQService
import no.nav.tilbakekreving.burdeforstatt.kontrakter.*
import no.nav.tilbakekreving.burdeforstatt.modell.OpprettTilbakekrevingRequest
import no.nav.tilbakekreving.burdeforstatt.modell.RequestFraBurdeForstatt
import no.nav.tilbakekreving.burdeforstatt.service.SendTilTilbakekreving
import java.time.LocalDate

fun main() {
    val request = OpprettTilbakekrevingRequest(
        fagsystem = Fagsystem.BA,
        ytelsestype = Ytelsestype.BARNETRYGD,
        personIdent = "123",
        eksternId = "123",
        eksternFagsakId = "123",
        manueltOpprettet = true,
        enhetId = "123",
        enhetsnavn = "enhetsnavn",
        saksbehandlerIdent = "saksbehandlerIdent",
        revurderingsvedtaksdato = LocalDate.now(),
        varsel = null,
        begrunnelseForTilbakekreving = "begrunnelse",
        faktainfo = Faktainfo(
            revurderingsårsak = "årsak",
            revurderingsresultat = ""
        )
    )

    val httpClient = defaultHttpClient()
    val appConfig = AppConfig(
        tokenEndpoint = System.getenv("NAIS_TOKEN_ENDPOINT"),
        tokenExchangeEndpoint = System.getenv("NAIS_TOKEN_EXCHANGE_ENDPOINT"),
        tokenIntrospectionEndpoint = System.getenv("NAIS_TOKEN_INTROSPECTION_ENDPOINT")
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
                post("/behandling") {
                    val requestFraBurdeForstatt = call.receive<RequestFraBurdeForstatt>()
                    val sendTilTilbakekreving = SendTilTilbakekreving(httpClient, mqService, tilbakekrevingUrl)
                    sendTilTilbakekreving.process(requestFraBurdeForstatt)
                    call.respond(HttpStatusCode.OK, "Behandling og MQ prosess igangsatt")
                }
            }
        }
    }
}
