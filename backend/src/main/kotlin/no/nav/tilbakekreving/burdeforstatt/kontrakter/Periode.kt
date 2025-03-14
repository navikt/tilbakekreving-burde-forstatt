package no.nav.tilbakekreving.burdeforstatt.kontrakter

import kotlinx.serialization.Serializable
import java.time.LocalDate

@Serializable
data class Periode(
    val fom: LocalDate,
    val tom: LocalDate,
)
