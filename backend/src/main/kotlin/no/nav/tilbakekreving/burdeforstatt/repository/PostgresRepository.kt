package no.nav.tilbakekreving.burdeforstatt.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import no.nav.tilbakekreving.burdeforstatt.entities.TidligereInnsendtKrav
import no.nav.tilbakekreving.burdeforstatt.entities.TidligereInnsendtKravPeriode
import no.nav.tilbakekreving.typer.v1.TypeGjelderDto
import java.math.BigDecimal
import java.math.BigInteger
import java.sql.Connection
import java.sql.Statement
import java.time.LocalDate
import javax.sql.DataSource

class PostgresRepository(
    private val dataSource: DataSource,
) : Repository {
    override suspend fun lagre(tidligereInnsendtKrav: TidligereInnsendtKrav) {
        withContext(Dispatchers.IO) {
            dataSource.connection.use { connection ->
                connection.autoCommit = false
                try {
                    val kravId = lagreKrav(connection, tidligereInnsendtKrav)
                    lagrePerioder(connection, kravId, tidligereInnsendtKrav)
                    connection.commit()
                } catch (e: Exception) {
                    connection.rollback()
                    throw e
                }
            }
        }
    }

    override suspend fun hent(fagsystemId: String): TidligereInnsendtKrav? =
        withContext(Dispatchers.IO) {
            dataSource.connection.use { connection ->
                val sql =
                    """
                    SELECT id, kravgrunnlag_id, vedtak_id, kode_fagomraade, fagsystem_id, vedtak_id_omgjort,
                           vedtak_gjelder_id, type_gjelder_id, utbetales_til_id, type_utbet_id,
                           enhet_ansvarlig, enhet_bosted, enhet_behandl, saksbeh_id
                    FROM tidligere_innsendt_krav
                    WHERE fagsystem_id = ?
                    ORDER BY id DESC
                    LIMIT 1
                    """.trimIndent()

                connection.prepareStatement(sql).use { statement ->
                    statement.setString(1, fagsystemId)
                    statement.executeQuery().use { resultSet ->
                        if (!resultSet.next()) return@withContext null

                        TidligereInnsendtKrav(
                            kravgrunnlagId = BigInteger(resultSet.getString("kravgrunnlag_id")),
                            vedtakId = BigInteger(resultSet.getString("vedtak_id")),
                            kodeFagomraade = resultSet.getString("kode_fagomraade"),
                            fagsystemId = resultSet.getString("fagsystem_id"),
                            vedtakIdOmgjort = BigInteger(resultSet.getString("vedtak_id_omgjort")),
                            vedtakGjelderId = resultSet.getString("vedtak_gjelder_id"),
                            typeGjelderId = TypeGjelderDto.valueOf(resultSet.getString("type_gjelder_id")),
                            utbetalesTilId = resultSet.getString("utbetales_til_id"),
                            typeUtbetId = TypeGjelderDto.valueOf(resultSet.getString("type_utbet_id")),
                            enhetAnsvarlig = resultSet.getString("enhet_ansvarlig"),
                            enhetBosted = resultSet.getString("enhet_bosted"),
                            enhetBehandl = resultSet.getString("enhet_behandl"),
                            saksbehId = resultSet.getString("saksbeh_id"),
                            tilbakekrevingsPeriode = hentPerioder(connection, resultSet.getLong("id")),
                        )
                    }
                }
            }
        }

    private fun hentPerioder(
        connection: Connection,
        kravId: Long,
    ): List<TidligereInnsendtKravPeriode> {
        val sql =
            """
            SELECT fom, tom, belop_tilbakekreves
            FROM tidligere_innsendt_krav_periode
            WHERE tidligere_innsendt_krav_id = ?
            ORDER BY fom
            """.trimIndent()

        connection.prepareStatement(sql).use { statement ->
            statement.setLong(1, kravId)
            statement.executeQuery().use { resultSet ->
                val perioder = mutableListOf<TidligereInnsendtKravPeriode>()
                while (resultSet.next()) {
                    perioder.add(
                        TidligereInnsendtKravPeriode(
                            fom = resultSet.getObject("fom", LocalDate::class.java),
                            tom = resultSet.getObject("tom", LocalDate::class.java),
                            belopTilbakekreves = BigDecimal(resultSet.getLong("belop_tilbakekreves")),
                        ),
                    )
                }
                return perioder
            }
        }
    }

    private fun lagreKrav(
        connection: Connection,
        tidligereInnsendtKrav: TidligereInnsendtKrav,
    ): Long {
        val sql =
            """
            INSERT INTO tidligere_innsendt_krav (
                kravgrunnlag_id, vedtak_id, kode_fagomraade, fagsystem_id, vedtak_id_omgjort,
                vedtak_gjelder_id, type_gjelder_id, utbetales_til_id, type_utbet_id,
                enhet_ansvarlig, enhet_bosted, enhet_behandl, saksbeh_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """.trimIndent()

        connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS).use { statement ->
            statement.setString(1, tidligereInnsendtKrav.kravgrunnlagId.toString())
            statement.setString(2, tidligereInnsendtKrav.vedtakId.toString())
            statement.setString(3, tidligereInnsendtKrav.kodeFagomraade)
            statement.setString(4, tidligereInnsendtKrav.fagsystemId)
            statement.setString(5, tidligereInnsendtKrav.vedtakIdOmgjort.toString())
            statement.setString(6, tidligereInnsendtKrav.vedtakGjelderId)
            statement.setString(7, tidligereInnsendtKrav.typeGjelderId.name)
            statement.setString(8, tidligereInnsendtKrav.utbetalesTilId)
            statement.setString(9, tidligereInnsendtKrav.typeUtbetId.name)
            statement.setString(10, tidligereInnsendtKrav.enhetAnsvarlig)
            statement.setString(11, tidligereInnsendtKrav.enhetBosted)
            statement.setString(12, tidligereInnsendtKrav.enhetBehandl)
            statement.setString(13, tidligereInnsendtKrav.saksbehId)
            statement.executeUpdate()

            statement.generatedKeys.use { keys ->
                check(keys.next()) { "Fikk ingen generert id ved lagring av tidligere innsendt krav" }
                return keys.getLong(1)
            }
        }
    }

    private fun lagrePerioder(
        connection: Connection,
        kravId: Long,
        tidligereInnsendtKrav: TidligereInnsendtKrav,
    ) {
        val sql =
            """
            INSERT INTO tidligere_innsendt_krav_periode (
                tidligere_innsendt_krav_id, fom, tom, belop_tilbakekreves
            ) VALUES (?, ?, ?, ?)
            """.trimIndent()

        connection.prepareStatement(sql).use { statement ->
            tidligereInnsendtKrav.tilbakekrevingsPeriode.forEach { periode ->
                statement.setLong(1, kravId)
                statement.setObject(2, periode.fom)
                statement.setObject(3, periode.tom)
                statement.setLong(4, periode.belopTilbakekreves.toLong())
                statement.addBatch()
            }
            statement.executeBatch()
        }
    }
}
