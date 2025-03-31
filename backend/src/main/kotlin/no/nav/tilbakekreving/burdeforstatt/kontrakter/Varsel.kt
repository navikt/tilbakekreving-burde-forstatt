package no.nav.tilbakekreving.burdeforstatt.kontrakter

import java.math.BigDecimal

data class Varsel(
    val varseltekst: String,
    val sumFeilutbetaling: BigDecimal,
    val perioder: MutableList<Periode> = mutableListOf(),
)
