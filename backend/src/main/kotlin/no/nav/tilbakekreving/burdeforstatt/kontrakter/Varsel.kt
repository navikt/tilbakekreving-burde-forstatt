package no.nav.tilbakekreving.burdeforstatt.kontrakter

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonFormat

import java.math.BigDecimal


data class Varsel(
    @JsonProperty("varseltekst") val varseltekst: String,
    @JsonProperty("sumFeilutbetaling") val sumFeilutbetaling: BigDecimal,
    @JsonProperty("perioder") val perioder: MutableList<Periode> = mutableListOf(),
)
