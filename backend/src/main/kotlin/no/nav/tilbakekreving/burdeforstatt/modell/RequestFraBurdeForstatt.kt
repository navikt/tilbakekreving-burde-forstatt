package no.nav.tilbakekreving.burdeforstatt.modell

import no.nav.tilbakekreving.burdeforstatt.kontrakter.PeriodeIRequest

data class RequestFraBurdeForstatt(
    val perioder: List<PeriodeIRequest>,
    val sendKravgrunnlag: Boolean,
    val ytelse: String,
    val personIdent: String,
)
