package no.nav.tilbakekreving.burdeforstatt.auth

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.ResponseException
import io.ktor.client.request.forms.submitForm
import io.ktor.http.HttpStatusCode
import io.ktor.http.parameters
import no.nav.tilbakekreving.burdeforstatt.config.AppConfig

class AuthClient(
    private val appConfig: AppConfig,
    private val httpClient: HttpClient,
) {
    suspend fun token(target: String): TokenResponse =
        try {
            httpClient
                .submitForm(
                    appConfig.tokenEndpoint,
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
                    appConfig.tokenExchangeEndpoint,
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
                appConfig.tokenIntrospectionEndpoint,
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
