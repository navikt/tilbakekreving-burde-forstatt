package no.nav.tilbakekreving.burdeforstatt.service

import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.async
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.runBlocking
import no.nav.tilbakekreving.burdeforstatt.repository.BehandlingInfo
import no.nav.tilbakekreving.burdeforstatt.repository.BehandlingInfoRepository
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
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
    fun `mottar URL under opprettelse og beholder siste melding`() =
        runBlocking {
            val repository = TestRepository()
            val venter = BehandlingUrlVenter(repository)
            assertEquals(
                "https://behandling/ny",
                venter.ventPåUrl("BF1") {
                    venter.mottaUrl("BF1", "https://behandling/1")
                    venter.mottaUrl("BF1", "https://behandling/ny")
                },
            )
            assertEquals("https://behandling/ny", repository.hent("BF1")?.saksbehandlingUrl)
        }

    @Test
    fun `kobler samtidige opprettelser til riktig fagsak på tvers av replikaer`() =
        runBlocking {
            val repository = TestRepository()
            val venter = BehandlingUrlVenter(repository, pollIntervallMillis = 1)
            val kafkaVenter = BehandlingUrlVenter(repository)
            val første = async(start = CoroutineStart.UNDISPATCHED) { venter.ventPåUrl("BF1") {} }
            val andre = async(start = CoroutineStart.UNDISPATCHED) { venter.ventPåUrl("BF2") {} }
            kafkaVenter.mottaUrl("BF2", "https://behandling/2")
            assertEquals("https://behandling/2", andre.await())
            assertFalse(første.isCompleted)
            kafkaVenter.mottaUrl("BF1", "https://behandling/1")
            assertEquals("https://behandling/1", første.await())
        }

    @Test
    fun `sender kravgrunnlag og returnerer eksisterende URL uten ny melding`() =
        runBlocking {
            val repository = TestRepository()
            val venter = BehandlingUrlVenter(repository, pollIntervallMillis = 1)
            venter.mottaUrl("BF1", "https://behandling/1")
            var sendt = false
            assertEquals("https://behandling/1", venter.ventPåUrl("BF1") { sendt = true })
            assertEquals(true, sendt)
        }

    @Test
    fun `timeout beholder informasjon og sene meldinger lagres`() =
        runBlocking {
            val repository = TestRepository()
            val venter = BehandlingUrlVenter(repository, timeoutMillis = 10, pollIntervallMillis = 1)
            repository.behandlinger["BF1"] = BehandlingInfo(null)
            assertNull(venter.ventPåUrl("BF1") {})
            assertEquals(BehandlingInfo(null), repository.hent("BF1"))
            venter.mottaUrl("BF1", "https://behandling/sen")
            assertEquals("https://behandling/sen", repository.hent("BF1")?.saksbehandlingUrl)
            assertEquals("https://behandling/sen", venter.ventPåUrl("BF1") {})
        }

    @Test
    fun `feil og kansellering beholder behandlingsinformasjon`() =
        runBlocking {
            val repository = TestRepository()
            val venter = BehandlingUrlVenter(repository)
            venter.mottaUrl("BF1", "https://behandling/1")
            assertFailsWith<IllegalArgumentException> {
                venter.ventPåUrl("BF1") { throw IllegalArgumentException("Sending feilet") }
            }
            val jobb = async(start = CoroutineStart.UNDISPATCHED) { venter.ventPåUrl("BF1") {} }
            jobb.cancelAndJoin()
            assertEquals("https://behandling/1", repository.hent("BF1")?.saksbehandlingUrl)
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
