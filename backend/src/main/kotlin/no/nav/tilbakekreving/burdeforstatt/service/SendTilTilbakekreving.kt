package no.nav.tilbakekreving.burdeforstatt.service

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
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
import java.math.BigDecimal
import java.time.LocalDate

class SendTilTilbakekreving(
    private val httpClient: HttpClient,
    private val mqService: MQService,
    private val tilbakekrevingUrl: String,
    private val token: String?
) {
    val testRequest = OpprettTilbakekrevingRequest(
        fagsystem = Fagsystem.BA,
        ytelsestype = Ytelsestype.BARNETRYGD,
        personIdent = "12345678901",
        eksternId = "123",
        eksternFagsakId = "123",
        manueltOpprettet = false,
        enhetId = "123",
        enhetsnavn = "enhetsnavn",
        saksbehandlerIdent = "saksbehandlerIdent",
        revurderingsvedtaksdato = LocalDate.now(),
        varsel = Varsel(
            varseltekst = "Varsel tekst",
            sumFeilutbetaling = BigDecimal(10000),
            perioder = mutableListOf(Periode(fom = LocalDate.now(), tom = LocalDate.now().minusYears(2)))
        ),
        begrunnelseForTilbakekreving = "begrunnelse",
        faktainfo = Faktainfo(
            revurderingsårsak = "årsak",
            revurderingsresultat = ""
        )
    )

    private val log = LoggerFactory.getLogger(this::class.java)

    suspend fun process(requestFraBurdeForstatt: RequestFraBurdeForstatt) {

        val opprettTilbakekrevingRequest = getOpprettTilbakekrevingRequest(requestFraBurdeForstatt)
        val behandlingSuccess = opprettBehandlingITilbakekreving(opprettTilbakekrevingRequest)

        if (behandlingSuccess.status == Ressurs.Status.SUKSESS) {
            val opprettDummyKravgrunnlag = opprettDummyKravgrunnlag(opprettTilbakekrevingRequest)
            sendKravgrunnlagTilTilbakekreving(opprettDummyKravgrunnlag)
        } else {
            log.warn("Kunne ikke sende Behandling til tilbakekreving, skipper MQ sending")
        }
    }

    private fun getOpprettTilbakekrevingRequest(requestFraBurdeForstatt: RequestFraBurdeForstatt): OpprettTilbakekrevingRequest {

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
            varsel = opprettVarselFraRequest(requestFraBurdeForstatt),
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
            val mapper = jacksonObjectMapper().registerModule(JavaTimeModule())
            val json = mapper.writeValueAsString(request)

            log.debug("Sending JSON: {}", json)
            log.debug("TestRequest: {}", testRequest)
            log.debug("==>>  Body: {}", request)

            val response: HttpResponse = httpClient.post(tilbakekrevingUri) {
                contentType(ContentType.Application.Json)
                header(HttpHeaders.Authorization, "Bearer $token")
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