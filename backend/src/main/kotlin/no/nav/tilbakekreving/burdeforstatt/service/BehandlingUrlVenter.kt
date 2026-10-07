package no.nav.tilbakekreving.burdeforstatt.service

import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import no.nav.tilbakekreving.burdeforstatt.repository.BehandlingUrlRepository
import java.util.UUID

class BehandlingUrlVenter(
    private val repository: BehandlingUrlRepository,
    private val timeoutMillis: Long = 60_000,
    private val pollIntervallMillis: Long = 500,
) {
    suspend fun ventPåUrl(
        eksternFagsakId: String,
        opprettBehandling: suspend () -> Unit,
    ): String? {
        val foresporselId = UUID.randomUUID()
        try {
            check(repository.registrer(eksternFagsakId, foresporselId)) {
                "Venter allerede på behandling for fagsak $eksternFagsakId"
            }
            opprettBehandling()
            return withTimeoutOrNull(timeoutMillis) {
                var url = repository.hent(foresporselId)
                while (url == null) {
                    delay(pollIntervallMillis)
                    url = repository.hent(foresporselId)
                }
                url
            }
        } finally {
            withContext(NonCancellable) { repository.fjern(foresporselId) }
        }
    }

    suspend fun mottaUrl(
        eksternFagsakId: String,
        saksbehandlingUrl: String,
    ) {
        repository.lagre(eksternFagsakId, saksbehandlingUrl)
    }
}
