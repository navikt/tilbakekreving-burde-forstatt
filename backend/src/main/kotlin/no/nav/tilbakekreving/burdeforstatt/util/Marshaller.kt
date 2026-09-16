package no.nav.tilbakekreving.burdeforstatt.util

import jakarta.xml.bind.JAXBContext
import jakarta.xml.bind.JAXBException
import jakarta.xml.bind.Marshaller
import org.slf4j.LoggerFactory
import java.io.StringWriter
import java.util.concurrent.ConcurrentHashMap
import kotlin.reflect.KClass

object Marshaller {
    private val log = LoggerFactory.getLogger(Marshaller::class.java)
    private val contextCache = ConcurrentHashMap<KClass<*>, JAXBContext>()

    fun marshall(value: Any?): String {
        requireNotNull(value) { "Kan ikke marshalle null-verdi" }

        return try {
            val jaxbContext =
                contextCache.computeIfAbsent(value::class) {
                    JAXBContext.newInstance(it.java)
                }

            val marshaller: Marshaller = jaxbContext.createMarshaller()
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true)

            try {
                marshaller.setProperty(
                    "org.glassfish.jaxb.namespacePrefixMapper",
                    CustomNamespacePrefixMapper(),
                )
            } catch (e: Exception) {
                log.warn("Namespace prefix mapper er ikke støttet for type {}", value::class.qualifiedName, e)
            }

            val stringWriter = StringWriter()
            marshaller.marshal(value, stringWriter)
            stringWriter.toString()
        } catch (e: JAXBException) {
            log.error("Kunne ikke marshalle objekt av type {}", value::class.qualifiedName, e)
            throw e
        }
    }
}
