package no.nav.tilbakekreving.burdeforstatt.kontrakter

data class Faktainfo(
    val revurderingsårsak: String,
    val revurderingsresultat: String,
    val tilbakekrevingsvalg: Tilbakekrevingsvalg? = Tilbakekrevingsvalg.OPPRETT_TILBAKEKREVING_UTEN_VARSEL,
    val konsekvensForYtelser: Set<String> = emptySet(),
)

enum class Tilbakekrevingsvalg {
    OPPRETT_TILBAKEKREVING_MED_VARSEL,
    OPPRETT_TILBAKEKREVING_UTEN_VARSEL,
    OPPRETT_TILBAKEKREVING_AUTOMATISK,
    IGNORER_TILBAKEKREVING,
}
