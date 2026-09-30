package no.nav.tilbakekreving.burdeforstatt.kontrakter

import java.util.UUID

data class Revurdering(
    val originalBehandlingId: UUID,
    val fagsakId: String,
    val revurderingsårsak: Revurderingsårsak,
    val ytelse: String,
)

enum class Revurderingsårsak {
    REVURDERING_KLAGE_NFP,
    REVURDERING_KLAGE_KA,
    REVURDERING_OPPLYSNINGER_OM_VILKÅR,
    REVURDERING_OPPLYSNINGER_OM_FORELDELSE,
    REVURDERING_FEILUTBETALT_BELØP_HELT_ELLER_DELVIS_BORTFALT,
}
