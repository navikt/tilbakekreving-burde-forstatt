package no.nav.tilbakekreving.burdeforstatt.service

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.coroutines.runBlocking
import no.nav.tilbakekreving.burdeforstatt.kontrakter.Ressurs
import no.nav.tilbakekreving.burdeforstatt.modell.OpprettTilbakekrevingRequest
import no.nav.tilbakekreving.burdeforstatt.modell.TilbakekrevingOgKravgrunnlag
import no.nav.tilbakekreving.burdeforstatt.modell.kravgrunnlag.DetaljertKravgrunnlagDto
import org.slf4j.LoggerFactory

class SendTilTilbakekreving(
    private val httpClient: HttpClient,
    private val mqService: MQService,
    private val tilbakekrevingUrl: String
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    fun process(tilbakekrevingOgKravgrunnlag: TilbakekrevingOgKravgrunnlag) {
        val opprettTilbakekrevingRequest = tilbakekrevingOgKravgrunnlag.opprettTilbakekrevingRequest
        val detaljertKravgrunnlagDto = tilbakekrevingOgKravgrunnlag.detaljertKravgrunnlagDto

        val behandlingSuccess = opprettBehandlingITilbakekreving(opprettTilbakekrevingRequest)

        if (behandlingSuccess.status == Ressurs.Status.SUKSESS) {
            sendKravgrunnlagTilTilbakekreving(detaljertKravgrunnlagDto)
        } else {
            log.warn("Kunne ikke sende Behandling til tilbakekreving, skipper MQ sending")
        }
    }

    private fun opprettBehandlingITilbakekreving(request: OpprettTilbakekrevingRequest): Ressurs<String> = runBlocking {
        return@runBlocking try {
            val response: HttpResponse = httpClient.post(tilbakekrevingUrl) {
                contentType(ContentType.Application.Json)
                setBody(request)
            }

            if (response.status == HttpStatusCode.OK) {
                val eksternBrukId: String = response.body<String>()

                log.info("Behandling er sent til tilbakekreving med eksternBrukId: $eksternBrukId")
                Ressurs.success(eksternBrukId, melding = "Behandling er opprettet.")
            } else {
                log.warn("Kunne ikke opprette: ${response.status}")
                Ressurs(
                    data = null,
                    status = Ressurs.Status.FEILET,
                    melding = "Feil ved sending av behandling: ${response.status}",
                    frontendFeilmelding = "Kunne ikke sende behandling.",
                    stacktrace = null
                )
            }
        } catch (e: Exception) {
            log.error("Error sending REST request: ${e.message}")
            Ressurs(
                data = null,
                status = Ressurs.Status.FEILET,
                melding = "Exception: ${e.message}",
                frontendFeilmelding = "En feil oppstod under behandling.",
                stacktrace = e.stackTraceToString()
            )
        }
    }

    private fun sendKravgrunnlagTilTilbakekreving(dto: DetaljertKravgrunnlagDto) {
        try {
            mqService.sendMessage(dto)
            log.info("Kravgrunnlag med id ${dto.kravgrunnlagId} sendt til MQ")
        } catch (e: Exception) {
            log.error("Kunne ikke sende kravgrunnlag med id ${dto.kravgrunnlagId} to MQ: ${e.message}")
        }
    }
}