package no.nav.tilbakekreving.burdeforstatt.config

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.flywaydb.core.Flyway
import javax.sql.DataSource

data class DbConfig(
    val jdbcUrl: String,
    val username: String,
    val password: String,
) {
    fun createDataSource(): DataSource =
        HikariDataSource(
            HikariConfig().apply {
                jdbcUrl = this@DbConfig.jdbcUrl
                username = this@DbConfig.username
                password = this@DbConfig.password
                driverClassName = "org.postgresql.Driver"
                maximumPoolSize = 5
            },
        )

    fun migrate(dataSource: DataSource) {
        Flyway
            .configure()
            .dataSource(dataSource)
            .load()
            .migrate()
    }
}
