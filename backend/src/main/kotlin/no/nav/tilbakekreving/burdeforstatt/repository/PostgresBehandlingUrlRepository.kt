package no.nav.tilbakekreving.burdeforstatt.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID
import javax.sql.DataSource

class PostgresBehandlingUrlRepository(
    private val dataSource: DataSource,
) : BehandlingUrlRepository {
    override suspend fun registrer(
        eksternFagsakId: String,
        foresporselId: UUID,
    ): Boolean =
        withContext(Dispatchers.IO) {
            dataSource.connection.use { connection ->
                val sql =
                    """
                    INSERT INTO behandling_url (ekstern_fagsak_id, foresporsel_id, utlopstid)
                    VALUES (?, ?, CURRENT_TIMESTAMP + INTERVAL '5 minutes')
                    ON CONFLICT (ekstern_fagsak_id) DO UPDATE
                    SET foresporsel_id = EXCLUDED.foresporsel_id,
                        saksbehandling_url = NULL,
                        utlopstid = EXCLUDED.utlopstid
                    WHERE behandling_url.utlopstid <= CURRENT_TIMESTAMP
                    """.trimIndent()
                connection.prepareStatement(sql).use { statement ->
                    statement.setString(1, eksternFagsakId)
                    statement.setObject(2, foresporselId)
                    statement.executeUpdate() == 1
                }
            }
        }

    override suspend fun hent(foresporselId: UUID): String? =
        withContext(Dispatchers.IO) {
            dataSource.connection.use { connection ->
                val sql =
                    """
                    SELECT saksbehandling_url
                    FROM behandling_url
                    WHERE foresporsel_id = ? AND utlopstid > CURRENT_TIMESTAMP
                    """.trimIndent()
                connection
                    .prepareStatement(sql)
                    .use { statement ->
                        statement.setObject(1, foresporselId)
                        statement.executeQuery().use { resultSet ->
                            if (resultSet.next()) resultSet.getString("saksbehandling_url") else null
                        }
                    }
            }
        }

    override suspend fun lagre(
        eksternFagsakId: String,
        saksbehandlingUrl: String,
    ) {
        withContext(Dispatchers.IO) {
            dataSource.connection.use { connection ->
                val sql =
                    """
                    UPDATE behandling_url
                    SET saksbehandling_url = ?
                    WHERE ekstern_fagsak_id = ? AND saksbehandling_url IS NULL AND utlopstid > CURRENT_TIMESTAMP
                    """.trimIndent()
                connection.prepareStatement(sql).use { statement ->
                    statement.setString(1, saksbehandlingUrl)
                    statement.setString(2, eksternFagsakId)
                    statement.executeUpdate()
                }
            }
        }
    }

    override suspend fun fjern(foresporselId: UUID) {
        withContext(Dispatchers.IO) {
            dataSource.connection.use { connection ->
                val sql = "DELETE FROM behandling_url WHERE foresporsel_id = ?"
                connection.prepareStatement(sql).use { statement ->
                    statement.setObject(1, foresporselId)
                    statement.executeUpdate()
                }
            }
        }
    }
}
