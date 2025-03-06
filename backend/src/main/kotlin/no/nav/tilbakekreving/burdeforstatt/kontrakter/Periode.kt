package no.nav.tilbakekreving.burdeforstatt.kontrakter

import java.time.LocalDate

data class Periode(
    val fom: LocalDate,
    val tom: LocalDate,
)
