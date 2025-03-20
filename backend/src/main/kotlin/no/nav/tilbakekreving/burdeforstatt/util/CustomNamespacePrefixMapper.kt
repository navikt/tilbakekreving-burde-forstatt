package no.nav.tilbakekreving.burdeforstatt.util

import jdk.internal.vm.StackChunk.init
import org.glassfish.jaxb.runtime.marshaller.NamespacePrefixMapper

class CustomNamespacePrefixMapper : NamespacePrefixMapper() {
    override fun getPreferredPrefix(namespaceUri: String, suggestion: String?, requirePrefix: Boolean): String {
        return when (namespaceUri) {
            "urn:no:nav:tilbakekreving:typer:v1" -> "mmel"
            "urn:no:nav:tilbakekreving:kravgrunnlag:detalj:v1" -> "urn"
            else -> suggestion ?: ""
        }
    }
}