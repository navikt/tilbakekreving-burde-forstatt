package no.nav.tilbakekreving.burdeforstatt.config

data class AppConfig(
    val tokenEndpoint: String,
    val tokenExchangeEndpoint: String,
    val tokenIntrospectionEndpoint: String,
    val loginRedirectUrl: String,
)
