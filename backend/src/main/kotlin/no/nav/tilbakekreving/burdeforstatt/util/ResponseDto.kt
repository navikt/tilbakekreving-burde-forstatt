package no.nav.tilbakekreving.burdeforstatt.util

import com.fasterxml.jackson.annotation.JsonProperty

data class ResponseDto(
    @JsonProperty("behandlingEksternId") val behandlingEksternId: String,
    @JsonProperty("kravgrunnlagId") val kravgrunnlagId: String
)
