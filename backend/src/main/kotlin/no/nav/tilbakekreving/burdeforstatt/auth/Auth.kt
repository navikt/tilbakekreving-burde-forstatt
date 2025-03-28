package no.nav.tilbakekreving.burdeforstatt.auth

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import org.slf4j.LoggerFactory

class TexasAuthenticationProvider(
    config: Config,
) : AuthenticationProvider(config) {
    class Config internal constructor(
        name: String?,
        val client: AuthClient
    ) : AuthenticationProvider.Config(name)
    private val client = config.client
    private val logger = LoggerFactory.getLogger("auth")

    override suspend fun onAuthenticate(context: AuthenticationContext) {
        val applicationCall = context.call
        val token = applicationCall.bearerToken()

        if (token == null) {
            logger.warn("unauthenticated: no Bearer token found in Authorization header")
            context.loginChallenge(AuthenticationFailedCause.NoCredentials)
            return
        }

        val introspectResponse =
            try {
                client.introspect(token)
            } catch (e: Exception) {
                // TODO(user): You should handle the specific exceptions that can be thrown by the HTTP client, e.g. retry on network errors and so on
                logger.error("unauthenticated: introspect request failed: ${e.message}")
                context.loginChallenge(AuthenticationFailedCause.Error(e.message ?: "introspect request failed"))
                return
            }

        if (!introspectResponse.active) {
            logger.warn("unauthenticated: ${introspectResponse.error}")
            context.loginChallenge(AuthenticationFailedCause.InvalidCredentials)
            return
        }

        logger.info("authenticated - claims='${introspectResponse.other}'")
        context.principal(
            TexasPrincipal(
                claims = introspectResponse.other,
                userinfo = TexasPrincipal.Userinfo(
                    email = introspectResponse.preferredUsername,
                    name = introspectResponse.name,
                    ident = introspectResponse.navIdent,
                ),
                token = token,
            ),
        )
    }

    private fun AuthenticationContext.loginChallenge(cause: AuthenticationFailedCause) {
        challenge("Texas", cause) { authenticationProcedureChallenge, call ->
            call.respond(HttpStatusCode.Unauthorized)
            authenticationProcedureChallenge.complete()
        }
    }
}

data class TexasPrincipal(
    val claims: Map<String, Any?>,
    val userinfo: Userinfo,
    val token: String,
) {
    data class Userinfo(
        val email: String,
        val name: String,
        val ident: String,
    )
}

fun ApplicationCall.bearerToken(): String? =
    request
        .authorization()
        ?.takeIf { it.startsWith("Bearer ", ignoreCase = true) }
        ?.removePrefix("Bearer ")
        ?.removePrefix("bearer ")
