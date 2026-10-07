package no.nav.tilbakekreving.burdeforstatt.repository

import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import no.nav.tilbakekreving.burdeforstatt.service.BehandlingUrlVenter
import org.flywaydb.core.Flyway
import org.junit.jupiter.api.Assumptions.assumeTrue
import org.postgresql.ds.PGSimpleDataSource
import java.util.UUID
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class PostgresBehandlingUrlRepositoryTest {
    @Test
    fun `deler URL mellom replikaer og isolerer ventende foresporsler`() =
        runBlocking {
            val jdbcUrl = System.getenv("TEST_POSTGRES_URL")
            assumeTrue(jdbcUrl != null, "Krever TEST_POSTGRES_URL til en testdatabase")
            val schema = "url_test_" + UUID.randomUUID().toString().replace("-", "")
            val dataSource =
                PGSimpleDataSource().apply {
                    setURL(jdbcUrl)
                    currentSchema = schema
                }
            try {
                Flyway
                    .configure()
                    .dataSource(dataSource)
                    .schemas(schema)
                    .load()
                    .migrate()
                val førsteRepository = PostgresBehandlingUrlRepository(dataSource)
                val andreRepository = PostgresBehandlingUrlRepository(dataSource)
                val httpVenter = BehandlingUrlVenter(førsteRepository, pollIntervallMillis = 10)
                val kafkaVenter = BehandlingUrlVenter(andreRepository)
                val registrert = CompletableDeferred<Unit>()
                val url = async { httpVenter.ventPåUrl("BF1") { registrert.complete(Unit) } }
                registrert.await()
                kafkaVenter.mottaUrl("BF1", "https://behandling/1")
                assertEquals("https://behandling/1", url.await())

                val førsteId = UUID.randomUUID()
                val andreId = UUID.randomUUID()
                assertTrue(førsteRepository.registrer("BF2", førsteId))
                assertFalse(andreRepository.registrer("BF2", andreId))
                andreRepository.fjern(andreId)
                andreRepository.lagre("BF2", "https://behandling/2")
                andreRepository.lagre("BF2", "https://behandling/duplikat")
                assertEquals("https://behandling/2", førsteRepository.hent(førsteId))

                dataSource.connection.use { connection ->
                    connection
                        .prepareStatement("UPDATE behandling_url SET utlopstid = CURRENT_TIMESTAMP - INTERVAL '1 second'")
                        .use { it.executeUpdate() }
                }
                assertNull(førsteRepository.hent(førsteId))
                assertTrue(andreRepository.registrer("BF2", andreId))
                assertNull(andreRepository.hent(andreId))
                førsteRepository.fjern(førsteId)
                førsteRepository.lagre("BF2", "https://behandling/ny")
                assertEquals("https://behandling/ny", andreRepository.hent(andreId))
                andreRepository.fjern(andreId)
                førsteRepository.lagre("BF2", "https://behandling/sen")
                assertTrue(førsteRepository.registrer("BF2", førsteId))
                assertNull(førsteRepository.hent(førsteId))
            } finally {
                dataSource.connection.use { connection ->
                    connection.createStatement().use { it.execute("DROP SCHEMA IF EXISTS $schema CASCADE") }
                }
            }
        }
}
