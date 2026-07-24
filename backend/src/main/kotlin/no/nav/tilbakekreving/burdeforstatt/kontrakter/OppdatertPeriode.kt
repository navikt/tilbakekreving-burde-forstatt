package no.nav.tilbakekreving.burdeforstatt.kontrakter

import java.math.BigDecimal
import java.time.LocalDate

data class KravgrunnlagInfoForOppdatering(
    val perioder: List<OppdatertPeriode>,
)

data class OppdatertPeriode(
    val fom: LocalDate,
    val tom: LocalDate,
    val belopTilbakekreves: BigDecimal,
)
