package no.nav.tilbakekreving.burdeforstatt.kontrakter

import kotlinx.serialization.Serializable
import java.math.BigDecimal

@Serializable
data class Varsel(
    val varseltekst: String,
    val sumFeilutbetaling: BigDecimal,
    val perioder: List<Periode >,
)
