package no.nav.tilbakekreving.burdeforstatt.service

import jakarta.jms.JMSException
import jakarta.jms.MessageProducer
import jakarta.jms.Queue
import jakarta.jms.Session
import jakarta.jms.TextMessage
import no.nav.tilbakekreving.burdeforstatt.config.MqConfig
import no.nav.tilbakekreving.burdeforstatt.kontrakter.Ytelsestype
import no.nav.tilbakekreving.burdeforstatt.util.Marshaller
import no.nav.tilbakekreving.kravgrunnlag.detalj.v1.DetaljertKravgrunnlagMelding
import org.slf4j.LoggerFactory

class MQService(private val mqConfig: MqConfig) {
    private val log = LoggerFactory.getLogger(this::class.java)

    fun sendMessage(
        detaljertKravgrunnlagMelding: DetaljertKravgrunnlagMelding,
        eksternFagsakId: String,
        ytelsestype: Ytelsestype,
    ) {
        try {
            val connection = mqConfig.createConnection()
            val session: Session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE)
            val queue: Queue = session.createQueue(mqConfig.queue)
            val producer: MessageProducer = session.createProducer(queue)

            val dtoXml = Marshaller.marshall(detaljertKravgrunnlagMelding)
            val message: TextMessage = session.createTextMessage(dtoXml)
            producer.send(message)

            connection.close()
        } catch (e: JMSException) {
            log.warn(
                "Kunne ikke sende kravgrunnlag med id {} til MQ",
                detaljertKravgrunnlagMelding.detaljertKravgrunnlag?.kravgrunnlagId,
                e,
            )
            throw e
        } catch (e: Exception) {
            log.warn(
                "Kunne ikke sende kravgrunnlag med id {} til MQ",
                detaljertKravgrunnlagMelding.detaljertKravgrunnlag?.kravgrunnlagId,
                e,
            )
            throw e
        }
    }
}
