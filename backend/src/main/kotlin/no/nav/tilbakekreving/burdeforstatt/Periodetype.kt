package no.nav.tilbakekreving.burdeforstatt

import no.nav.tilbakekreving.burdeforstatt.kontrakter.Periode
import java.time.YearMonth
import java.time.temporal.ChronoUnit

sealed interface Periodetype {
    fun splitt(
        periode: Periode,
        beløp: Long,
    ): List<PeriodeOgBeløp>

    object Meldekort : Periodetype {
        override fun splitt(
            periode: Periode,
            beløp: Long,
        ): List<PeriodeOgBeløp> {
            val totaltDager = ChronoUnit.DAYS.between(periode.fom, periode.tom)
            val fomYearMonth = YearMonth.from(periode.fom)
            val tomYearMonth = YearMonth.from(periode.tom)
            if (fomYearMonth == tomYearMonth) {
                return listOf(PeriodeOgBeløp(periode, beløp))
            }
            val periode1 = Periode(fom = periode.fom, tom = fomYearMonth.atEndOfMonth())
            val beløp1 = beløp / totaltDager * ChronoUnit.DAYS.between(periode1.fom, periode1.tom)
            return listOf(
                PeriodeOgBeløp(periode1, beløp1),
                PeriodeOgBeløp(
                    periode = Periode(fom = tomYearMonth.atDay(1), tom = periode.tom),
                    beløp = beløp - beløp1,
                ),
            )
        }
    }

    object Måned : Periodetype {
        override fun splitt(
            periode: Periode,
            beløp: Long,
        ): List<PeriodeOgBeløp> {
            val fomMåned = YearMonth.from(periode.fom)
            val tomMåned = YearMonth.from(periode.fom)
            return buildList {
                var cursor = fomMåned
                while (cursor in fomMåned.rangeUntil(tomMåned)) {
                    add(cursor)
                    cursor = fomMåned.plusMonths(1)
                }
            }.map {
                PeriodeOgBeløp(
                    periode = Periode(it.atDay(1), it.atEndOfMonth()),
                    beløp = beløp,
                )
            }
        }
    }
}

data class PeriodeOgBeløp(
    val periode: Periode,
    val beløp: Long,
)
