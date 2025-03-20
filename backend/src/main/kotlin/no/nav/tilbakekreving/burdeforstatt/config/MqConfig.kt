package no.nav.tilbakekreving.burdeforstatt.config

import com.ibm.msg.client.jakarta.jms.JmsConnectionFactory
import com.ibm.msg.client.jakarta.jms.JmsConstants
import com.ibm.msg.client.jakarta.jms.JmsFactoryFactory
import com.ibm.msg.client.jakarta.wmq.WMQConstants
import jakarta.jms.Connection
import jakarta.jms.JMSException
import org.slf4j.LoggerFactory

data class MqConfig(
    val host: String,
    val port: Int,
    val channel: String,
    val queueManager: String,
    val queue: String,
    val user: String,
    val password: String,
    val enabled: Boolean = true
){
    private val log = LoggerFactory.getLogger(this::class.java)

    fun createConnection(): Connection {
        val ff: JmsFactoryFactory = JmsFactoryFactory.getInstance(JmsConstants.JAKARTA_WMQ_PROVIDER)
        val factory: JmsConnectionFactory = ff.createConnectionFactory()

        factory.setStringProperty(WMQConstants.WMQ_HOST_NAME, host)
        factory.setIntProperty(WMQConstants.WMQ_PORT, port)
        factory.setStringProperty(WMQConstants.WMQ_CHANNEL, channel)
        factory.setStringProperty(WMQConstants.WMQ_QUEUE_MANAGER, queueManager)
        factory.setStringProperty(WMQConstants.USERID, user)
        factory.setStringProperty(WMQConstants.PASSWORD, password)
        factory.setIntProperty(WMQConstants.WMQ_CONNECTION_MODE, WMQConstants.WMQ_CM_CLIENT)

        repeat(3) { attempt ->
            try {
                return factory.createConnection()
            } catch (e: JMSException) {
                log.error("MQ connection failed, attempt ${attempt + 1}", e)
                Thread.sleep(2000) // Retry after 2 seconds
            }
        }
        throw RuntimeException("Failed to connect to MQ after 3 attempts")
    }
}
