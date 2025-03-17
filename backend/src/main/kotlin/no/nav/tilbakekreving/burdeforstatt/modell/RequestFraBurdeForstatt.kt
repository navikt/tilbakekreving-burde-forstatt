package no.nav.tilbakekreving.burdeforstatt.modell

import no.nav.tilbakekreving.burdeforstatt.kontrakter.Periode
import java.math.BigDecimal

data class RequestFraBurdeForstatt(
    val perioder: List<Periode>,
    val ytelse: String,
    val personIdent: String,
    val simulertBelop: BigDecimal,
    val kravgrunnlagBelop: BigDecimal
)


