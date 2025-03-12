package no.nav.tilbakekreving.burdeforstatt.modell

import no.nav.tilbakekreving.burdeforstatt.modell.kravgrunnlag.DetaljertKravgrunnlagDto


data class TilbakekrevingOgKravgrunnlag(
    val opprettTilbakekrevingRequest: OpprettTilbakekrevingRequest,
    val detaljertKravgrunnlagDto: DetaljertKravgrunnlagDto
)
