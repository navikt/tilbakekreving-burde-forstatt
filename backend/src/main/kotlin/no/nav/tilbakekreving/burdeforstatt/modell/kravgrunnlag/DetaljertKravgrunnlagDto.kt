package no.nav.tilbakekreving.burdeforstatt.modell.kravgrunnlag

import com.fasterxml.jackson.annotation.JsonProperty
import java.math.BigInteger
import java.security.SecureRandom
import java.time.LocalDate

data class DetaljertKravgrunnlagDto(
    @JsonProperty("kravgrunnlagId") var kravgrunnlagId: BigInteger? = randomBigInteger(),
    @JsonProperty("vedtakId") var vedtakId: BigInteger? = randomBigInteger(),
    @JsonProperty("kodeStatusKrav") var kodeStatusKrav: String? = null,
    @JsonProperty("kodeFagomraade") var kodeFagomraade: String? = null,
    @JsonProperty("fagsystemId") var fagsystemId: String? = null,
    @JsonProperty("datoVedtakFagsystem") var datoVedtakFagsystem: LocalDate? = null,
    @JsonProperty("vedtakIdOmgjort") var vedtakIdOmgjort: BigInteger? = null,
    @JsonProperty("vedtakGjelderId") var vedtakGjelderId: String? = null,
    @JsonProperty("typeGjelderId") var typeGjelderId: TypeGjelderDto? = null,
    @JsonProperty("utbetalesTilId") var utbetalesTilId: String? = null,
    @JsonProperty("typeUtbetId") var typeUtbetId: TypeGjelderDto? = null,
    @JsonProperty("kodeHjemmel") var kodeHjemmel: String? = null,
    @JsonProperty("renterBeregnes") var renterBeregnes: JaNeiDto? = null,
    @JsonProperty("enhetAnsvarlig") var enhetAnsvarlig: String? = null,
    @JsonProperty("enhetBosted") var enhetBosted: String? = null,
    @JsonProperty("enhetBehandl") var enhetBehandl: String? = null,
    @JsonProperty("kontrollfelt") var kontrollfelt: String? = null,
    @JsonProperty("saksbehId") var saksbehId: String? = null,
    @JsonProperty("referanse") var referanse: String? = null,
    @JsonProperty("tilbakekrevingsPeriode") var tilbakekrevingsPeriode: List<DetaljertKravgrunnlagPeriodeDto>? = null,
)

private fun randomBigInteger(numBits: Int = 64): BigInteger {
    return BigInteger(numBits, SecureRandom())
}

enum class TypeGjelderDto {
    PERSON,
    ORGANISASJON,
    SAMHANDLER,
    APPBRUKER;

    fun value(): String {
        return this.name
    }

    companion object {
        fun fromValue(v: String): TypeGjelderDto {
            return TypeGjelderDto.valueOf(v)
        }
    }
}

enum class JaNeiDto {
    J,
    N;

    fun value(): String {
        return this.name
    }

    companion object {
        fun fromValue(v: String): JaNeiDto {
            return JaNeiDto.valueOf(v)
        }
    }
}