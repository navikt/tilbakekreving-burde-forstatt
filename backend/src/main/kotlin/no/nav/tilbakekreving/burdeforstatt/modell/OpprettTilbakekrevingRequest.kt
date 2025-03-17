package no.nav.tilbakekreving.burdeforstatt.modell


import com.fasterxml.jackson.annotation.JsonProperty
import kotlinx.serialization.Serializable
import no.nav.tilbakekreving.burdeforstatt.kontrakter.*
import java.time.LocalDate
import java.util.UUID


data class OpprettTilbakekrevingRequest(
   @JsonProperty("fagsystem") val fagsystem: Fagsystem,
    @JsonProperty("regelverk") val regelverk: Regelverk? = null,
    @JsonProperty("ytelsestype") val ytelsestype: Ytelsestype,
    @JsonProperty("eksternFagsakId") val eksternFagsakId: String? = UUID.randomUUID().toString(),
    @JsonProperty("personIdent") val personIdent: String,
    // Fagsystemreferanse til behandlingen, må være samme id som brukes mot datavarehus og økonomi
    @JsonProperty("eksternId") val eksternId: String? = UUID.randomUUID().toString(),
    @JsonProperty("behandlingstype") val behandlingstype: Behandlingstype? = Behandlingstype.TILBAKEKREVING,
    @JsonProperty("manueltOpprettet") val manueltOpprettet: Boolean,
    @JsonProperty("språkkode") val språkkode: Språkkode = Språkkode.NB,
    @JsonProperty("enhetId") val enhetId: String,
    @JsonProperty("enhetsnavn") val enhetsnavn: String,
    @JsonProperty("saksbehandlerIdent") val saksbehandlerIdent: String,
    @JsonProperty("varsel") val varsel: Varsel?,
    @JsonProperty("revurderingsvedtaksdato") val revurderingsvedtaksdato: LocalDate,
    @JsonProperty("verge") val verge: Verge? = null,
    @JsonProperty("faktainfo") val faktainfo: Faktainfo,
    @JsonProperty("institusjon") val institusjon: Institusjon? = null,
    @JsonProperty("manuelleBrevmottakere") val manuelleBrevmottakere: Set<Brevmottaker> = emptySet(),
    @JsonProperty("begrunnelseForTilbakekreving") val begrunnelseForTilbakekreving: String?,
) {
    init {
        if (manueltOpprettet) {
            require(varsel == null) { "Kan ikke opprette manuelt behandling med varsel" }
        }
    }
}
