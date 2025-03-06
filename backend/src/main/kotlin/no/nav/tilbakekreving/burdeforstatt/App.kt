package no.nav.tilbakekreving.burdeforstatt

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
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

    embeddedServer(Netty, port = 8080){
        registerApiRoutes()
    }.start(wait = true)

}

private fun Application.registerApiRoutes() {
    routing {
           get("/liveness") {
               call.respondText("OK")
           }
            get("/readiness") {
                call.respondText("OK")
            }
    }
}
