package no.nav.tilbakekreving.burdeforstatt.service

import kotlinx.coroutines.delay
import kotlinx.coroutines.withTimeoutOrNull
import no.nav.tilbakekreving.burdeforstatt.repository.BehandlingInfoRepository
import kotlin.time.Duration.Companion.milliseconds

class BehandlingUrlVenter(
    private val repository: BehandlingInfoRepository,
    private val timeoutMillis: Long = 60_000,
    private val pollIntervallMillis: Long = 500,
) {
    suspend fun hentEksisterendeUrl(eksternFagsakId: String): String =
        repository.hent(eksternFagsakId)?.saksbehandlingUrl
            ?: throw IllegalStateException("Fant ikke lagret behandlings-URL for fagsak $eksternFagsakId")

    suspend fun ventPåUrl(eksternFagsakId: String): String? =
        withTimeoutOrNull(timeoutMillis.milliseconds) {
            var behandlingInfo = repository.hent(eksternFagsakId)
            while (behandlingInfo?.saksbehandlingUrl == null) {
                delay(pollIntervallMillis.milliseconds)
                behandlingInfo = repository.hent(eksternFagsakId)
            }
            behandlingInfo.saksbehandlingUrl
        }

    suspend fun mottaUrl(
        eksternFagsakId: String,
        saksbehandlingUrl: String,
    ) {
        repository.lagre(eksternFagsakId, saksbehandlingUrl)
    }
}
