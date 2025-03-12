package no.nav.tilbakekreving.burdeforstatt.service

import jakarta.jms.*
import no.nav.tilbakekreving.burdeforstatt.config.MqConfig
import no.nav.tilbakekreving.burdeforstatt.kontrakter.objectMapper
import no.nav.tilbakekreving.burdeforstatt.modell.kravgrunnlag.DetaljertKravgrunnlagDto
import org.slf4j.LoggerFactory
import kotlin.contracts.contract


class MQService (private val mqConfig: MqConfig) {
    private val log = LoggerFactory.getLogger(this::class.java)

    fun sendMessage(dto: DetaljertKravgrunnlagDto) {
        log.info("Sender kravgrunnlag med id ${dto.kravgrunnlagId} til MQ")
        try {
            val connection = mqConfig.createConnection()
            val session: Session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE)
            val queue: Queue = session.createQueue(mqConfig.queue)
            val producer: MessageProducer = session.createProducer(queue)

            val dtoJson = objectMapper.writeValueAsString(dto)
            val message: TextMessage = session.createTextMessage(dtoJson)

            producer.send(message)
            log.info("Kravgrunnlag med id ${dto.kravgrunnlagId} sendt til MQ")
            connection.close()
        } catch (e: JMSException) {
            log.info("Kunne ikke sende kravgrunnlag med id ${dto.kravgrunnlagId} til MQ")
            log.warn("JMSException occurred: ${e.message}")
            e.printStackTrace()
        } catch (e: Exception) {
            log.info("Kunne ikke sende kravgrunnlag med id ${dto.kravgrunnlagId} til MQ")
            log.warn("An unexpected error occurred: ${e.message}")
            e.printStackTrace()
        }
    }

    fun receiveMessageFromQueue(queueName: String): String {
        val connection = mqConfig.createConnection()
        val session: Session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE)
        val queue: Queue = session.createQueue(queueName)
        val consumer: MessageConsumer = session.createConsumer(queue)

        connection.start()

        val message: Message? = consumer.receive(1000)
        connection.close()

        return if (message is TextMessage) {
            message.text
        } else {
            "No message received"
        }
    }
}
