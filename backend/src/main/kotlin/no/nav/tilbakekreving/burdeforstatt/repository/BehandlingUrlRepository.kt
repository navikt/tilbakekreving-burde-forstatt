package no.nav.tilbakekreving.burdeforstatt.repository

import java.util.UUID

interface BehandlingUrlRepository {
    suspend fun registrer(
        eksternFagsakId: String,
        foresporselId: UUID,
    ): Boolean

    suspend fun hent(foresporselId: UUID): String?

    suspend fun lagre(
        eksternFagsakId: String,
        saksbehandlingUrl: String,
    )

    suspend fun fjern(foresporselId: UUID)
}
