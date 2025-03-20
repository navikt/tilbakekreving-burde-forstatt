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
import no.nav.tilbakekreving.burdeforstatt.util.ResponseDto
import org.slf4j.LoggerFactory
import java.time.LocalDate

class SendTilTilbakekreving(
    private val httpClient: HttpClient,
    private val mqService: MQService,
    private val tilbakekrevingUrl: String,
    private val token: String?,
    private val navIdent: String
) {

    private val log = LoggerFactory.getLogger(this::class.java)

    suspend fun process(requestFraBurdeForstatt: RequestFraBurdeForstatt): Ressurs<out Any> {

        val tilbakekrevingRequest = getOpprettTilbakekrevingRequest(requestFraBurdeForstatt)
        val behandling = opprettBehandlingITilbakekreving(tilbakekrevingRequest)

        if (behandling.status != Ressurs.Status.SUKSESS){
            log.error("Kunne ikke opprette behandling i tilbakekreving-backend. Skipper sending av kravgrunnlag")
            return behandling
        }

        val dummyKravgrunnlag = opprettDummyKravgrunnlag(tilbakekrevingRequest)
        mqService.sendMessage(dummyKravgrunnlag)
        log.info("Kravgrunnlag med id {} er sendt til MQ", dummyKravgrunnlag.kravgrunnlagId)

        return Ressurs.success(
            data = "https://tilbakekreving.ansatt.dev.nav.no/fagsystem/EF/fagsak/${tilbakekrevingRequest.eksternFagsakId}/behandling/${behandling.data}",
            melding = "Behandling og kravgrunnlag er sendt til tilbakekreving-backend"
        )
    }

    private fun getOpprettTilbakekrevingRequest(requestFraBurdeForstatt: RequestFraBurdeForstatt): OpprettTilbakekrevingRequest {

        val faktainfo = Faktainfo(
            revurderingsårsak = "Test Årsak",
            revurderingsresultat = "Test",
        )
        return OpprettTilbakekrevingRequest(
            fagsystem = getFagsystem(requestFraBurdeForstatt.ytelse),
            ytelsestype = getYtelsesType(requestFraBurdeForstatt.ytelse),
            personIdent = requestFraBurdeForstatt.personIdent,
            manueltOpprettet = false,
            enhetId = "0106",
            enhetsnavn = "NAV Fredrikstad",
            saksbehandlerIdent = navIdent,
            revurderingsvedtaksdato = LocalDate.now(),
            varsel = opprettVarselFraRequest(requestFraBurdeForstatt),
            begrunnelseForTilbakekreving = "begrunnelse",
            faktainfo = faktainfo
        )
    }

    private fun getFagsystem(ytelseFraRequest: String): Fagsystem {
        return when (ytelseFraRequest) {
            "Barnetrygd" -> Fagsystem.BA
            "Kontantstøtte" -> Fagsystem.KONT
            "Overgangsstønad" -> Fagsystem.EF
            else -> throw IllegalArgumentException("Ukjent ytelse: $ytelseFraRequest")
        }
    }

    private fun getYtelsesType(ytelseFraRequest: String): Ytelsestype {
        return when (ytelseFraRequest) {
            "Barnetrygd" -> Ytelsestype.BARNETRYGD
            "Kontantstøtte" -> Ytelsestype.KONTANTSTØTTE
            "Overgangsstønad" -> Ytelsestype.OVERGANGSSTØNAD
            else -> throw IllegalArgumentException("Ukjent ytelse: $ytelseFraRequest")
        }
    }

    private fun opprettVarselFraRequest(request: RequestFraBurdeForstatt): Varsel{
        val periodeFraRequest = request.perioder

        val varsel = Varsel(
            varseltekst = "Varsel tekst",
            sumFeilutbetaling = request.perioder.sumOf { periode -> periode.simulertBelop },
        )
        periodeFraRequest.forEach { periode ->
            varsel.perioder.add(Periode(fom = periode.fom, tom = periode.tom))
        }

        return varsel
    }

    private suspend fun opprettBehandlingITilbakekreving(request: OpprettTilbakekrevingRequest): Ressurs<String> =
        try {
            val tilbakekrevingUri = URLBuilder(tilbakekrevingUrl).apply {
                appendPathSegments("api", "behandling", "v1")
            }.buildString()

            val response: HttpResponse = httpClient.post(tilbakekrevingUri) {
                contentType(ContentType.Application.Json)
                header(HttpHeaders.Authorization, "Bearer $token")
                setBody(request)
            }

            if (response.status == HttpStatusCode.OK) {
                val eksternBrukId: Ressurs<String> = response.body()

                log.info("Behandling er sent til tilbakekreving med eksternBrukId: {}", eksternBrukId)
                eksternBrukId
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

            mqService.sendMessage(dto)
            log.info("Kravgrunnlag med id {} er sendt til MQ", dto.kravgrunnlagId)

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