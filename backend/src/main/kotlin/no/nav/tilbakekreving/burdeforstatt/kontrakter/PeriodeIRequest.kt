package no.nav.tilbakekreving.burdeforstatt.kontrakter

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonProperty
import java.math.BigDecimal
import java.time.LocalDate

data class PeriodeIRequest(
     @JsonProperty("fom")
     @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
     val fom: LocalDate,
     @JsonProperty("tom")
     @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
     val tom: LocalDate,
     @JsonProperty("simulertBelop") val simulertBelop: BigDecimal,
     @JsonProperty("kravgrunnlagBelop") val kravgrunnlagBelop: BigDecimal
)