package no.nav.tilbakekreving.burdeforstatt.kontrakter

import java.math.BigDecimal
import java.time.LocalDate

data class PeriodeMedBelop(
    val fom: LocalDate,
    val tom: LocalDate,
    val belop: BigDecimal?,
    val avregnetBelop: BigDecimal? = null
)

