package no.nav.tilbakekreving.burdeforstatt.modell


import kotlinx.serialization.Serializable
import no.nav.tilbakekreving.burdeforstatt.kontrakter.*
import java.time.LocalDate
import java.util.UUID


data class OpprettTilbakekrevingRequest(
    val fagsystem: Fagsystem,
    val regelverk: Regelverk? = null,
    val ytelsestype: Ytelsestype,
    val eksternFagsakId: String? = UUID.randomUUID().toString(),
    val personIdent: String,
    // Fagsystemreferanse til behandlingen, må være samme id som brukes mot datavarehus og økonomi
    val eksternId: String? = UUID.randomUUID().toString(),
    val behandlingstype: Behandlingstype? = Behandlingstype.TILBAKEKREVING,
    val manueltOpprettet: Boolean,
    val språkkode: Språkkode = Språkkode.NB,
    val enhetId: String,
    val enhetsnavn: String,
    val saksbehandlerIdent: String,
    val varsel: Varsel?,
    val revurderingsvedtaksdato: LocalDate,
    val verge: Verge? = null,
    val faktainfo: Faktainfo,
    val institusjon: Institusjon? = null,
    val manuelleBrevmottakere: Set<Brevmottaker> = emptySet(),
    val begrunnelseForTilbakekreving: String?,
) {
    init {
        if (manueltOpprettet) {
            require(varsel == null) { "Kan ikke opprette manuelt behandling med varsel" }
        }
    }
}
