package no.nav.tilbakekreving.burdeforstatt.service

import com.fasterxml.jackson.databind.JsonNode
import net.logstash.logback.argument.StructuredArguments.keyValue
import no.nav.tilbakekreving.burdeforstatt.objectMapper
import org.apache.kafka.clients.consumer.KafkaConsumer
import org.apache.kafka.clients.producer.KafkaProducer
import org.apache.kafka.clients.producer.ProducerRecord
import org.slf4j.LoggerFactory
import java.time.LocalDate
import java.time.LocalDateTime
import kotlin.time.Duration.Companion.seconds
import kotlin.time.toJavaDuration

class FagsystemKafkaConsumer(
    private val kafkaConsumer: KafkaConsumer<String, String>,
    private val kafkaProducer: KafkaProducer<String, String>,
) : Runnable {
    private var running = true
    private val log = LoggerFactory.getLogger(this::class.java)

    private fun svarPåBehov(
        inputTopic: String,
        fnr: String,
        behov: JsonNode,
    ) {
        val fagsystemId = behov["eksternFagsakId"].asText()
        val kravgrunnlagReferanse = behov["kravgrunnlagReferanse"].asText()
        if (!fagsystemId.startsWith("BF")) return

        log.info("Svarer på fagsysteminfo_behov for fagsystemId $fagsystemId", keyValue("fagsystemId", fagsystemId))
        val svar =
            objectMapper.writeValueAsString(
                mapOf(
                    "hendelsestype" to "fagsysteminfo_svar",
                    "versjon" to 1,
                    "eksternFagsakId" to fagsystemId,
                    "hendelseOpprettet" to LocalDateTime.now(),
                    "mottaker" to
                        mapOf(
                            "type" to "PERSON",
                            "ident" to fnr,
                        ),
                    "revurdering" to
                        mapOf(
                            "behandlingId" to kravgrunnlagReferanse,
                            "årsak" to "UKJENT",
                            "årsakTilFeilutbetaling" to null,
                            "vedtaksdato" to LocalDate.now().minusDays(14),
                            "utvidPerioder" to null,
                        ),
                    "behandlendeEnhet" to "4491",
                ),
            )

        kafkaProducer.send(ProducerRecord(inputTopic, fnr, svar))
    }

    override fun run() {
        while (running) {
            try {
                kafkaConsumer.poll(10.seconds.toJavaDuration()).forEach {
                    val jsonObject = objectMapper.readTree(it.value())
                    val hendelsestype = jsonObject["hendelsestype"]?.asText()
                    if (hendelsestype == "fagsysteminfo_behov") {
                        svarPåBehov(it.topic(), it.key(), jsonObject)
                    }
                }
            } catch (e: Exception) {
                log.error("Feilet under konsumering av kafkameldinger", e)
            }
        }
    }

    fun stop() {
        running = false
    }
}
