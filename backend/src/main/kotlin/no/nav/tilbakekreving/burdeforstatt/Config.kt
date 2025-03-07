package no.nav.tilbakekreving.burdeforstatt

data class Config(
    val tokenEndpoint: String,
    val tokenExchangeEndpoint: String,
    val tokenIntrospectionEndpoint: String
)
