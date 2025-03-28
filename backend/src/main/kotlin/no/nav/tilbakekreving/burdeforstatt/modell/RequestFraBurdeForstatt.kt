package no.nav.tilbakekreving.burdeforstatt.modell

import com.fasterxml.jackson.annotation.JsonProperty
import no.nav.tilbakekreving.burdeforstatt.kontrakter.PeriodeIRequest

data class RequestFraBurdeForstatt(
    @JsonProperty("perioder") val perioder: List<PeriodeIRequest>,
    @JsonProperty("ytelse") val ytelse: String,
    @JsonProperty("personIdent") val personIdent: String,
)


