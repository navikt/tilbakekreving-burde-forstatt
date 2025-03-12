package no.nav.tilbakekreving.burdeforstatt.service

import jakarta.jms.*
import no.nav.tilbakekreving.burdeforstatt.config.MqConfig
import no.nav.tilbakekreving.burdeforstatt.kontrakter.objectMapper
import no.nav.tilbakekreving.burdeforstatt.modell.kravgrunnlag.DetaljertKravgrunnlagDto
import no.nav.tilbakekreving.burdeforstatt.util.Marshaller
import org.slf4j.LoggerFactory

class MQService (private val mqConfig: MqConfig) {
    private val log = LoggerFactory.getLogger(this::class.java)

    fun sendMessage(dto: DetaljertKravgrunnlagDto) {
        log.info("Sender kravgrunnlag med id {} til MQ", dto.kravgrunnlagId)
        try {
            val connection = mqConfig.createConnection()
            val session: Session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE)
            val queue: Queue = session.createQueue(mqConfig.queue)
            val producer: MessageProducer = session.createProducer(queue)

            val dtoXml = Marshaller.marshall(dto)
            val message: TextMessage = session.createTextMessage(dtoXml)

            producer.send(message)
            log.info("Kravgrunnlag med id {} sendt til MQ", dto.kravgrunnlagId)
            connection.close()
        } catch (e: JMSException) {
            log.info("Kunne ikke sende kravgrunnlag med id {} til MQ", dto.kravgrunnlagId)
            log.warn("JMSException occurred: {}", e.message)
            e.printStackTrace()
        } catch (e: Exception) {
            log.info("Kunne ikke sende kravgrunnlag med id {} til MQ", dto.kravgrunnlagId)
            log.warn("An unexpected error occurred: {}", e.message)
            e.printStackTrace()
        }
    }
}
