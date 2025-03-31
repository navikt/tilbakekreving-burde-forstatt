package no.nav.tilbakekreving.burdeforstatt.kontrakter

import java.math.BigDecimal
import java.time.LocalDate

data class PeriodeIRequest(
    val fom: LocalDate,
    val tom: LocalDate,
    val simulertBelop: BigDecimal,
    val kravgrunnlagBelop: BigDecimal,
)
