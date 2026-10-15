package no.nav.tilbakekreving.burdeforstatt.service

import kotlinx.coroutines.runBlocking
import no.nav.tilbakekreving.burdeforstatt.repository.BehandlingInfo
import no.nav.tilbakekreving.burdeforstatt.repository.BehandlingInfoRepository
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNull

class BehandlingUrlVenterTest {
    @Test
    fun `henter eksisterende URL uten ny Kafka-melding`() =
        runBlocking {
            val venter = BehandlingUrlVenter(TestRepository())
            venter.mottaUrl("BF1", "https://behandling/1")
            assertEquals("https://behandling/1", venter.hentEksisterendeUrl("BF1"))
            venter.mottaUrl("BF1", "https://behandling/ny")
            assertEquals("https://behandling/ny", venter.hentEksisterendeUrl("BF1"))
        }

    @Test
    fun `manglende lagret URL gir eksplisitt feil`() {
        runBlocking {
            val venter = BehandlingUrlVenter(TestRepository())
            assertFailsWith<IllegalStateException> { venter.hentEksisterendeUrl("BF1") }
        }
    }

    @Test
    fun `timeout beholder informasjon og sene meldinger lagres`() =
        runBlocking {
            val repository = TestRepository()
            val venter = BehandlingUrlVenter(repository, timeoutMillis = 10, pollIntervallMillis = 1)
            repository.behandlinger["BF1"] = BehandlingInfo(null)
            assertNull(venter.ventPåUrl("BF1"))
            assertEquals(BehandlingInfo(null), repository.hent("BF1"))
            venter.mottaUrl("BF1", "https://behandling/sen")
            assertEquals("https://behandling/sen", repository.hent("BF1")?.saksbehandlingUrl)
            assertEquals("https://behandling/sen", venter.ventPåUrl("BF1"))
        }

    private class TestRepository : BehandlingInfoRepository {
        val behandlinger = mutableMapOf<String, BehandlingInfo>()

        override suspend fun hent(eksternFagsakId: String): BehandlingInfo? = behandlinger[eksternFagsakId]

        override suspend fun lagre(
            eksternFagsakId: String,
            saksbehandlingUrl: String,
        ) {
            behandlinger[eksternFagsakId] =
                BehandlingInfo(saksbehandlingUrl)
        }
    }
}
