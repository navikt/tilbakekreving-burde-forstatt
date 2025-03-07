package no.nav.tilbakekreving.burdeforstatt

import com.fasterxml.jackson.databind.DeserializationFeature
import io.ktor.client.*
import io.ktor.client.engine.apache5.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.jackson.*


fun defaultHttpClient() =
    HttpClient(Apache5) {
        expectSuccess = true
        install(ContentNegotiation) {
            jackson {
                deserializationConfig.apply {
                    configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                }
            }
        }
    }
