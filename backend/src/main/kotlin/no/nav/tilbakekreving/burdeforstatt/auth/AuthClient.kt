package no.nav.tilbakekreving.burdeforstatt.auth

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.*
import io.ktor.client.request.forms.*
import io.ktor.http.*
import no.nav.tilbakekreving.burdeforstatt.Config


class AuthClient(
    private val config: Config,
    private val httpClient: HttpClient,
    ) {

    suspend fun token(target: String): TokenResponse =
        try {
            httpClient
                .submitForm(
                    config.tokenEndpoint,
                    parameters {
                        set("target", target)
                        set("identity_provider", "azuread")
                    },
                ).body<TokenResponse.Success>()
        } catch (e: ResponseException) {
            TokenResponse.Error(e.response.body<TokenErrorResponse>(), e.response.status)
        }

    suspend fun exchange(
        target: String,
        userToken: String,
    ): TokenResponse =
        try {
            httpClient
                .submitForm(
                    config.tokenExchangeEndpoint,
                    parameters {
                        set("target", target)
                        set("user_token", userToken)
                        set("identity_provider", "azuread")
                    },
                ).body<TokenResponse.Success>()
        } catch (e: ResponseException) {
            TokenResponse.Error(e.response.body<TokenErrorResponse>(), e.response.status)
        }

    suspend fun introspect(accessToken: String): TokenIntrospectionResponse =
        httpClient
            .submitForm(
                config.tokenIntrospectionEndpoint,
                parameters {
                    set("token", accessToken)
                    set("identity_provider", "azuread")
                },
            ).body()
}

sealed class TokenResponse {
    data class Success(
        @JsonProperty("access_token")
        val accessToken: String,
        @JsonProperty("expires_in")
        val expiresInSeconds: Int,
    ) : TokenResponse()

    data class Error(
        val error: TokenErrorResponse,
        val status: HttpStatusCode,
    ) : TokenResponse()
}

data class TokenErrorResponse(
    val error: String,
    @JsonProperty("error_description")
    val errorDescription: String,
)

data class TokenIntrospectionResponse(
    val active: Boolean,
    @JsonInclude(JsonInclude.Include.NON_NULL)
    val error: String?,
    @JsonProperty("NAVident")
    val navIdent: String,
    @JsonProperty("preferred_username")
    val preferredUsername: String,
    val name: String,
    @JsonAnySetter @get:JsonAnyGetter
    val other: Map<String, Any?> = mutableMapOf(),
)
