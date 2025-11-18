package no.nav.tilbakekreving.burdeforstatt.config

import org.apache.kafka.clients.consumer.KafkaConsumer
import org.apache.kafka.clients.producer.KafkaProducer
import org.apache.kafka.common.serialization.StringDeserializer
import org.apache.kafka.common.serialization.StringSerializer
import java.util.Properties

data class KafkaConfig(
    private val kafkaBrokers: String,
    private val keystorePath: String,
    private val truststorePath: String,
    private val credstorePassword: String,
) {
    fun Properties.setConnectionProperties() {
        put("bootstrap.servers", kafkaBrokers)
        put("security.protocol", "SSL")
        put("ssl.keystore.type", "PKCS12")
        put("ssl.keystore.location", keystorePath)
        put("ssl.keystore.password", credstorePassword)
        put("ssl.key.password", credstorePassword)
        put("ssl.truststore.type", "PKCS12")
        put("ssl.truststore.location", truststorePath)
        put("ssl.truststore.password", credstorePassword)
    }

    fun createProducer(): KafkaProducer<String, String> {
        val properties = Properties()
        properties.setConnectionProperties()
        return KafkaProducer(properties, StringSerializer(), StringSerializer())
    }

    fun createConsumer(): KafkaConsumer<String, String> {
        val properties = Properties()
        properties.setConnectionProperties()
        properties.put("group.id", "burde-forstatt")

        val consumer = KafkaConsumer(properties, StringDeserializer(), StringDeserializer())
        consumer.subscribe(
            listOf(
                "tilbake.privat-tilbakekreving-tilleggsstonad",
                "tilbake.privat-tilbakekreving-arbeidsavklaringspenger",
            ),
        )
        return consumer
    }
}
