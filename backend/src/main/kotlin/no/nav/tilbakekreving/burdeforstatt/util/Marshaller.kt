package no.nav.tilbakekreving.burdeforstatt.util

import jakarta.xml.bind.JAXBContext
import jakarta.xml.bind.JAXBException
import jakarta.xml.bind.Marshaller
import no.nav.tilbakekreving.kravgrunnlag.detalj.v1.DetaljertKravgrunnlagMelding
import org.slf4j.LoggerFactory
import java.io.StringWriter

object Marshaller {
    val log = LoggerFactory.getLogger(Marshaller::class.java)
    val jaxbContext = JAXBContext.newInstance(
        DetaljertKravgrunnlagMelding::class.java,
    )

    fun marshall(
        detaljertKravgrunnlagMelding: DetaljertKravgrunnlagMelding
    ): String = try {
        val marshaller: Marshaller = jaxbContext.createMarshaller()
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true)
        try {
            marshaller.setProperty("org.glassfish.jaxb.namespacePrefixMapper", CustomNamespacePrefixMapper())
        } catch (e: Exception) {
            log.warn("Namespace prefix mapper er ikke støttet", e)
            throw e
        }

        val stringWriter = StringWriter()
        marshaller.marshal(detaljertKravgrunnlagMelding, stringWriter)
        stringWriter.toString()
    } catch (e: JAXBException) {
        log.error("Kunne ikke marshalle Kravgrunnlag med id: {}", detaljertKravgrunnlagMelding.detaljertKravgrunnlag?.kravgrunnlagId, e)
        throw e
    }
}