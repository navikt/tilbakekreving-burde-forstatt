package no.nav.tilbakekreving.burdeforstatt.kontrakter

import java.io.PrintWriter
import java.io.StringWriter

/**
 * Objekt som brukes for utveksling av data mellom familietjenester.
 * Brukes både mellom systemer og til frontend.
 *
 * @param T typen til data i objektet.
 * @param status status på request. Kan være 200 OK med feilet ressurs
 * @param melding teknisk melding som ikke skal inneholde sensitive data
 * @param frontendFeilmelding feilmelding forbehold frontend og kan inneholde sensitive data
 * @param stacktrace stacktrace fra feil som kan være nyttig til debugging i familie-prosessering
 */
data class Ressurs<T>(
    val data: T?,
    val status: Status,
    val melding: String,
    val frontendFeilmelding: String? = null,
    val stacktrace: String?,
) {
    enum class Status {
        SUKSESS,
        FEILET,
        IKKE_HENTET,
        IKKE_TILGANG,
        FUNKSJONELL_FEIL,
    }

    companion object {
        fun <T> success(
            data: T,
            melding: String?,
        ): Ressurs<T> =
            Ressurs(
                data = data,
                status = Status.SUKSESS,
                melding = melding ?: "Innhenting av data var vellykket",
                stacktrace = null,
            )

        private fun Throwable.textValue(): String {
            val sw = StringWriter()
            this.printStackTrace(PrintWriter(sw))
            return sw.toString()
        }
    }

    override fun toString(): String = "Ressurs(status=$status, melding='$melding')"
}

fun <T> Ressurs<T>.getDataOrThrow(): T =
    when (this.status) {
        Ressurs.Status.SUKSESS -> data ?: error("Data er null i Ressurs")
        else -> error(melding)
    }
