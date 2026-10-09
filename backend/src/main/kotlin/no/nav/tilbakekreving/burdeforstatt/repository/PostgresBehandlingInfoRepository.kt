package no.nav.tilbakekreving.burdeforstatt.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.sql.DataSource

class PostgresBehandlingInfoRepository(
    private val dataSource: DataSource,
) : BehandlingInfoRepository {
    override suspend fun hent(eksternFagsakId: String): BehandlingInfo? =
        withContext(Dispatchers.IO) {
            dataSource.connection.use { connection ->
                val sql =
                    """
                    SELECT saksbehandling_url
                    FROM behandling_info
                    WHERE ekstern_fagsak_id = ?
                    """.trimIndent()
                connection
                    .prepareStatement(sql)
                    .use { statement ->
                        statement.setString(1, eksternFagsakId)
                        statement.executeQuery().use { resultSet ->
                            if (resultSet.next()) {
                                BehandlingInfo(
                                    saksbehandlingUrl = resultSet.getString("saksbehandling_url"),
                                )
                            } else {
                                null
                            }
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
                    INSERT INTO behandling_info (ekstern_fagsak_id, saksbehandling_url)
                    VALUES (?, ?)
                    ON CONFLICT (ekstern_fagsak_id) DO UPDATE
                    SET saksbehandling_url = EXCLUDED.saksbehandling_url
                    WHERE behandling_info.saksbehandling_url IS DISTINCT FROM EXCLUDED.saksbehandling_url
                    """.trimIndent()
                connection.prepareStatement(sql).use { statement ->
                    statement.setString(1, eksternFagsakId)
                    statement.setString(2, saksbehandlingUrl)
                    statement.executeUpdate()
                }
            }
        }
    }
}
