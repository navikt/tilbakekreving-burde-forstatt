package no.nav.tilbakekreving.burdeforstatt.service

import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.async
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import no.nav.tilbakekreving.burdeforstatt.repository.BehandlingUrlRepository
import java.util.UUID
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertNull

class BehandlingUrlVenterTest {
    @Test
    fun `mottar URL under opprettelse og ignorerer duplikater`() =
        runBlocking {
            val venter = BehandlingUrlVenter(TestRepository())
            val url =
                venter.ventPåUrl("BF1") {
                    venter.mottaUrl("BF1", "https://behandling/1")
                    venter.mottaUrl("BF1", "https://behandling/duplikat")
                }
            assertEquals("https://behandling/1", url)
        }

    @Test
    fun `kobler samtidige opprettelser til riktig fagsak`() =
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
    fun `rydder opp ved timeout og beholder ikke sene meldinger`() =
        runBlocking {
            val venter = BehandlingUrlVenter(TestRepository(), timeoutMillis = 10, pollIntervallMillis = 1)
            assertNull(venter.ventPåUrl("BF1") {})
            venter.mottaUrl("BF1", "https://behandling/gammel")
            assertEquals(
                "https://behandling/ny",
                venter.ventPåUrl("BF1") { venter.mottaUrl("BF1", "https://behandling/ny") },
            )
        }

    @Test
    fun `propagerer feil fra opprettelse og rydder opp`() =
        runBlocking {
            val venter = BehandlingUrlVenter(TestRepository())
            assertFailsWith<IllegalArgumentException> {
                venter.ventPåUrl("BF1") { throw IllegalArgumentException("Sending feilet") }
            }
            assertEquals(
                "https://behandling/1",
                venter.ventPåUrl("BF1") { venter.mottaUrl("BF1", "https://behandling/1") },
            )
        }

    @Test
    fun `rydder opp ved kansellering`() =
        runBlocking {
            val venter = BehandlingUrlVenter(TestRepository())
            val registrert = CompletableDeferred<Unit>()
            val jobb = launch { venter.ventPåUrl("BF1") { registrert.complete(Unit) } }
            registrert.await()
            jobb.cancelAndJoin()
            assertEquals(
                "https://behandling/1",
                venter.ventPåUrl("BF1") { venter.mottaUrl("BF1", "https://behandling/1") },
            )
        }

    @Test
    fun `avviser samtidig venting for samme fagsak uten å fjerne originalen`() =
        runBlocking {
            val repository = TestRepository()
            val venter = BehandlingUrlVenter(repository, pollIntervallMillis = 1)
            val annenReplika = BehandlingUrlVenter(repository)
            val første = async(start = CoroutineStart.UNDISPATCHED) { venter.ventPåUrl("BF1") {} }
            assertFailsWith<IllegalStateException> { annenReplika.ventPåUrl("BF1") {} }
            venter.mottaUrl("BF1", "https://behandling/1")
            assertEquals("https://behandling/1", første.await())
        }

    private class TestRepository : BehandlingUrlRepository {
        private data class Venting(
            val id: UUID,
            var url: String? = null,
        )

        private val ventende = mutableMapOf<String, Venting>()

        override suspend fun registrer(
            eksternFagsakId: String,
            foresporselId: UUID,
        ): Boolean {
            if (eksternFagsakId in ventende) return false
            ventende[eksternFagsakId] = Venting(foresporselId)
            return true
        }

        override suspend fun hent(foresporselId: UUID): String? = ventende.values.find { it.id == foresporselId }?.url

        override suspend fun lagre(
            eksternFagsakId: String,
            saksbehandlingUrl: String,
        ) {
            ventende[eksternFagsakId]?.let {
                if (it.url == null) it.url = saksbehandlingUrl
            }
        }

        override suspend fun fjern(foresporselId: UUID) {
            ventende.entries.removeIf { it.value.id == foresporselId }
        }
    }
}
