package no.nav.tilbakekreving.burdeforstatt

import io.ktor.client.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.util.reflect.*
import no.nav.tilbakekreving.burdeforstatt.auth.AuthClient
import no.nav.tilbakekreving.burdeforstatt.auth.TexasAuthenticationProvider
import no.nav.tilbakekreving.burdeforstatt.auth.TexasPrincipal
import no.nav.tilbakekreving.burdeforstatt.kontrakter.*
import java.time.LocalDate

fun main() {
    println("Hello world!")
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
    val config = Config(
        tokenEndpoint = System.getenv("NAIS_TOKEN_ENDPOINT") ?: "http://localhost:4001/api/v1/token",
        tokenExchangeEndpoint = System.getenv("NAIS_TOKEN_EXCHANGE_ENDPOINT") ?: "http://localhost:4001/api/v1/token/exchange",
        tokenIntrospectionEndpoint = System.getenv("NAIS_TOKEN_INTROSPECTION_ENDPOINT") ?: "http://localhost:4001/api/v1/introspect",
        loginRedirectUrl = System.getenv("POST_LOGIN_REDIRECT_URL") ?: "http://localhost:5173/",
    )

    embeddedServer(Netty, port = 8080) {
        registerApiRoutes(config, httpClient)
    }.start(wait = true)

}

private fun Application.registerApiRoutes(config: Config, httpClient: HttpClient) {
    val authClient = AuthClient(
        config = config,
        httpClient = httpClient
    )
    authentication {
        register(TexasAuthenticationProvider(TexasAuthenticationProvider.Config("azuread", authClient)))
    }

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
                get("/redirect") {
                    call.respondRedirect(config.loginRedirectUrl)
                }
            }
        }

    }
}
