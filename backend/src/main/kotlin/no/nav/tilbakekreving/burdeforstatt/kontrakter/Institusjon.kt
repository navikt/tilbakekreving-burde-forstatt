package no.nav.tilbakekreving.burdeforstatt.kontrakter

import kotlinx.serialization.Serializable

@Serializable
data class Institusjon(
    val organisasjonsnummer: String,
)
