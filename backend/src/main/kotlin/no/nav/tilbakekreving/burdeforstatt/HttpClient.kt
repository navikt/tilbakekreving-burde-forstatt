package no.nav.tilbakekreving.burdeforstatt

import io.ktor.client.HttpClient
import io.ktor.client.engine.apache5.Apache5
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.serialization.jackson3.jackson
import tools.jackson.databind.DeserializationFeature
import tools.jackson.databind.cfg.DateTimeFeature

fun defaultHttpClient() =
    HttpClient(Apache5) {
        expectSuccess = true
        install(ContentNegotiation) {
            jackson {
                configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                enable(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY)
                disable(DateTimeFeature.WRITE_DATES_AS_TIMESTAMPS)
            }
        }
    }
