package no.nav.tilbakekreving.burdeforstatt.repository

data class BehandlingInfo(
    val saksbehandlingUrl: String?,
)

interface BehandlingInfoRepository {
    suspend fun hent(eksternFagsakId: String): BehandlingInfo?

    suspend fun lagre(
        eksternFagsakId: String,
        saksbehandlingUrl: String,
    )
}
