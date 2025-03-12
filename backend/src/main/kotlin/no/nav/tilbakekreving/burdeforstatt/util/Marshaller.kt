package no.nav.tilbakekreving.burdeforstatt.util

import jakarta.xml.bind.JAXBContext
import jakarta.xml.bind.JAXBException
import jakarta.xml.bind.Marshaller
import no.nav.tilbakekreving.burdeforstatt.modell.kravgrunnlag.DetaljertKravgrunnlagDto
import org.slf4j.LoggerFactory
import java.io.StringWriter

object Marshaller {
    val log = LoggerFactory.getLogger(Marshaller::class.java)
    val jaxbContext = JAXBContext.newInstance(DetaljertKravgrunnlagDto::class.java)

    fun marshall(
        dto: DetaljertKravgrunnlagDto
    ): String = try {
        val marshaller = jaxbContext.createMarshaller()
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true)
        val stringWriter = StringWriter()
        marshaller.marshal(dto, stringWriter)
        stringWriter.toString()
    } catch (e: JAXBException) {
        log.error("Kunne ikke marshalle Kravgrunnlag med id: {}", dto.kravgrunnlagId)
        throw (e)
    }

}