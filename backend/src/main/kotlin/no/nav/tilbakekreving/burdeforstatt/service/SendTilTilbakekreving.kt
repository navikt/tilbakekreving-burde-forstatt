package no.nav.tilbakekreving.burdeforstatt.service

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import no.nav.tilbakekreving.burdeforstatt.kontrakter.*
import no.nav.tilbakekreving.burdeforstatt.modell.OpprettTilbakekrevingRequest
import no.nav.tilbakekreving.burdeforstatt.modell.RequestFraBurdeForstatt
import no.nav.tilbakekreving.burdeforstatt.modell.kravgrunnlag.DetaljertKravgrunnlagBelopDto
import no.nav.tilbakekreving.burdeforstatt.modell.kravgrunnlag.DetaljertKravgrunnlagDto
import no.nav.tilbakekreving.burdeforstatt.modell.kravgrunnlag.DetaljertKravgrunnlagPeriodeDto
import no.nav.tilbakekreving.burdeforstatt.modell.kravgrunnlag.PeriodeDto
import org.slf4j.LoggerFactory
import java.time.LocalDate

class SendTilTilbakekreving(
    private val httpClient: HttpClient,
    private val mqService: MQService,
    private val tilbakekrevingUrl: String
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    suspend fun process(requestFraBurdeForstatt: RequestFraBurdeForstatt) {

        val opprettTilbakekrevingRequest = getOpprettTilbakekrevingRequest(requestFraBurdeForstatt)
        val behandlingSuccess = opprettBehandlingITilbakekreving(requestFraBurdeForstatt)

        if (behandlingSuccess.status == Ressurs.Status.SUKSESS) {
            val opprettDummyKravgrunnlag = opprettDummyKravgrunnlag(opprettTilbakekrevingRequest)
            sendKravgrunnlagTilTilbakekreving(opprettDummyKravgrunnlag)
        } else {
            log.warn("Kunne ikke sende Behandling til tilbakekreving, skipper MQ sending")
        }
    }

    private fun getOpprettTilbakekrevingRequest(requestFraBurdeForstatt: RequestFraBurdeForstatt): OpprettTilbakekrevingRequest {

        val varsel = Varsel(
            varseltekst = "Varsel tekst",
            sumFeilutbetaling = requestFraBurdeForstatt.simulertBelop,
            perioder = requestFraBurdeForstatt.perioder
        )
        val faktainfo = Faktainfo(
            revurderingsårsak = "Norsk",
            revurderingsresultat = "Test",
        )
        return OpprettTilbakekrevingRequest(
            fagsystem = getFagsystem(requestFraBurdeForstatt.ytelse),
            ytelsestype = getYtelsesType(requestFraBurdeForstatt.ytelse),
            personIdent = requestFraBurdeForstatt.personIdent,
            manueltOpprettet = false,
            enhetId = "0106",
            enhetsnavn = "NAV Fredrikstad",
            saksbehandlerIdent = "0106",
            revurderingsvedtaksdato = LocalDate.now(),
            varsel = varsel,
            begrunnelseForTilbakekreving = "begrunnelse",
            faktainfo = faktainfo
        )

    }

    private fun getFagsystem(ytelseFraRequest: String): Fagsystem {
        return when (ytelseFraRequest) {
            "Barnetrygd" -> Fagsystem.BA
            "Kontantstøtte" -> Fagsystem.KONT
            "Overgangstønad" -> Fagsystem.EF
            else -> throw IllegalArgumentException("Ukjent ytelse: $ytelseFraRequest")
        }
    }

    private fun getYtelsesType(ytelseFraRequest: String): Ytelsestype {
        return when (ytelseFraRequest) {
            "Barnetrygd" -> Ytelsestype.BARNETRYGD
            "Kontantstøtte" -> Ytelsestype.KONTANTSTØTTE
            "Overgangstønad" -> Ytelsestype.OVERGANGSSTØNAD
            else -> throw IllegalArgumentException("Ukjent ytelse: $ytelseFraRequest")
        }
    }

    private suspend fun opprettBehandlingITilbakekreving(request: RequestFraBurdeForstatt): Ressurs<String> =
        try {
            val response: HttpResponse = httpClient.post(tilbakekrevingUrl) {
                contentType(ContentType.Application.Json)
                setBody(request)
            }

            if (response.status == HttpStatusCode.OK) {
                val eksternBrukId: String = response.body<String>()

                log.info("Behandling er sent til tilbakekreving med eksternBrukId: {}", eksternBrukId)
                Ressurs.success(eksternBrukId, melding = "Behandling er opprettet.")
            } else {
                log.warn("Kunne ikke opprette: {}", response.status)
                Ressurs(
                    data = null,
                    status = Ressurs.Status.FEILET,
                    melding = "Feil ved sending av behandling: ${response.status}",
                    frontendFeilmelding = "Kunne ikke sende behandling.",
                    stacktrace = null
                )
            }
        } catch (e: Exception) {
            log.error("Error sending REST request: {}", e.message)
            Ressurs(
                data = null,
                status = Ressurs.Status.FEILET,
                melding = "Exception: ${e.message}",
                frontendFeilmelding = "En feil oppstod under behandling.",
                stacktrace = e.stackTraceToString()
            )
        }

    private fun sendKravgrunnlagTilTilbakekreving(dto: DetaljertKravgrunnlagDto) {
        try {
            mqService.sendMessage(dto)
            log.info("Kravgrunnlag med id {} sendt til MQ", dto.kravgrunnlagId)
        } catch (e: Exception) {
            log.error("Kunne ikke sende kravgrunnlag med id {} to MQ: {}", dto.kravgrunnlagId, e.message)
        }
    }

    private fun opprettDummyKravgrunnlag(opprettTilbakekrevingRequest: OpprettTilbakekrevingRequest): DetaljertKravgrunnlagDto {
        val belopFraRequest = opprettTilbakekrevingRequest.varsel?.sumFeilutbetaling
        val periodeListeFraRequest = opprettTilbakekrevingRequest.varsel?.perioder

        val periodeMedBelopListe = mutableListOf<PeriodeMedBelop>()
        val detaljertKravgrunnlagPeriodeDto = mutableListOf<DetaljertKravgrunnlagPeriodeDto>()

        periodeListeFraRequest?.forEach { periode ->
            periodeMedBelopListe.add(PeriodeMedBelop(periode.fom, periode.tom, belopFraRequest))
        }

        periodeMedBelopListe.forEach { periode ->
            detaljertKravgrunnlagPeriodeDto.add(
                DetaljertKravgrunnlagPeriodeDto(
                    periode = PeriodeDto(periode.fom, periode.tom),
                    tilbakekrevingsBelop = listOf(DetaljertKravgrunnlagBelopDto(belopNy = periode.belop, belopTilbakekreves = periode.belop))
                ))
        }

        return DetaljertKravgrunnlagDto(tilbakekrevingsPeriode = detaljertKravgrunnlagPeriodeDto)

    }
}