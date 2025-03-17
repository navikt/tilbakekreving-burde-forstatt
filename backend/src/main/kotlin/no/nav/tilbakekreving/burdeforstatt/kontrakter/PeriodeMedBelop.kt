package no.nav.tilbakekreving.burdeforstatt.kontrakter

import com.fasterxml.jackson.annotation.JsonProperty
import java.math.BigDecimal
import java.time.LocalDate

data class PeriodeMedBelop(
    @JsonProperty("fom") val fom: LocalDate,
    @JsonProperty("tom") val tom: LocalDate,
    @JsonProperty("belop") val belop: BigDecimal?,
    @JsonProperty("avregnetBelop") val avregnetBelop: BigDecimal? = null
)

