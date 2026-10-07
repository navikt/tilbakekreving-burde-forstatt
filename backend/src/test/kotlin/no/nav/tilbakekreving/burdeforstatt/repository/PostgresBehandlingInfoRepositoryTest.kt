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
import kotlin.test.assertNull

class PostgresBehandlingInfoRepositoryTest {
    @Test
    fun `bevarer migrerte data og deler nye hendelser mellom replikaer`() =
        runBlocking {
            val jdbcUrl = System.getenv("TEST_POSTGRES_URL")
            assumeTrue(jdbcUrl != null, "Krever TEST_POSTGRES_URL til en testdatabase")
            val schema = "info_test_" + UUID.randomUUID().toString().replace("-", "")
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
                    .target("4")
                    .load()
                    .migrate()
                dataSource.connection.use { connection ->
                    connection
                        .prepareStatement(
                            """
                            INSERT INTO behandling_url (ekstern_fagsak_id, foresporsel_id, saksbehandling_url, utlopstid)
                            VALUES ('BF1', ?, 'https://behandling/1', CURRENT_TIMESTAMP)
                            """.trimIndent(),
                        ).use {
                            it.setObject(1, UUID.randomUUID())
                            it.executeUpdate()
                        }
                }
                Flyway
                    .configure()
                    .dataSource(dataSource)
                    .schemas(schema)
                    .load()
                    .migrate()
                val første = PostgresBehandlingInfoRepository(dataSource)
                val andre = PostgresBehandlingInfoRepository(dataSource)
                assertEquals(BehandlingInfo("https://behandling/1"), første.hent("BF1"))
                assertNull(første.hent("BF2"))

                val httpVenter = BehandlingUrlVenter(første, pollIntervallMillis = 10)
                val kafkaVenter = BehandlingUrlVenter(andre)
                val registrert = CompletableDeferred<Unit>()
                val url = async { httpVenter.ventPåUrl("BF2") { registrert.complete(Unit) } }
                registrert.await()
                kafkaVenter.mottaUrl("BF2", "https://behandling/2")
                assertEquals("https://behandling/2", url.await())
                andre.lagre("BF1", "https://behandling/1")
                assertEquals(BehandlingInfo("https://behandling/1"), første.hent("BF1"))
                andre.lagre("BF1", "https://behandling/ny")
                assertEquals(BehandlingInfo("https://behandling/ny"), første.hent("BF1"))
                andre.lagre("BF2", "https://behandling/2")
                assertEquals(BehandlingInfo("https://behandling/2"), første.hent("BF2"))
            } finally {
                dataSource.connection.use { connection ->
                    connection.createStatement().use { it.execute("DROP SCHEMA IF EXISTS $schema CASCADE") }
                }
            }
        }
}
