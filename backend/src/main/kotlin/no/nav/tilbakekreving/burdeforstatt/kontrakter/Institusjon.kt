package no.nav.tilbakekreving.burdeforstatt.kontrakter

import com.fasterxml.jackson.annotation.JsonProperty

data class Institusjon(
    @JsonProperty("organisasjonsnummer") val organisasjonsnummer: String,
)
