package no.nav.tilbakekreving.burdeforstatt.kontrakter

import com.fasterxml.jackson.annotation.JsonProperty

data class Faktainfo(
    @JsonProperty("revurderingsårsak") val revurderingsårsak: String,
    @JsonProperty("revurderingsresultat") val revurderingsresultat: String,
    @JsonProperty("tilbakekrevingsvalg") val tilbakekrevingsvalg: Tilbakekrevingsvalg? = Tilbakekrevingsvalg.OPPRETT_TILBAKEKREVING_UTEN_VARSEL,
    @JsonProperty("konsekvensForYtelser") val konsekvensForYtelser: Set<String> = emptySet(),
)

enum class Tilbakekrevingsvalg {
    OPPRETT_TILBAKEKREVING_MED_VARSEL,
    OPPRETT_TILBAKEKREVING_UTEN_VARSEL,
    OPPRETT_TILBAKEKREVING_AUTOMATISK,
    IGNORER_TILBAKEKREVING,
}
