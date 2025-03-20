package no.nav.tilbakekreving.burdeforstatt.modell.kravgrunnlag

import com.fasterxml.jackson.annotation.JsonProperty
import java.math.BigInteger
import java.security.SecureRandom
import java.time.LocalDate

import jakarta.xml.bind.annotation.*

@XmlRootElement(name = "DetaljertKravgrunnlag")
@XmlAccessorType(XmlAccessType.FIELD)
data class DetaljertKravgrunnlagDto(
    @XmlElement(name = "kravgrunnlagId") @JsonProperty("kravgrunnlagId")
    var kravgrunnlagId: BigInteger? = randomBigInteger(),

    @XmlElement(name = "vedtakId") @JsonProperty("vedtakId")
    var vedtakId: BigInteger? = randomBigInteger(),

    @XmlElement(name = "kodeStatusKrav") @JsonProperty("kodeStatusKrav")
    var kodeStatusKrav: String? = null,

    @XmlElement(name = "kodeFagomraade") @JsonProperty("kodeFagomraade")
    var kodeFagomraade: String? = null,

    @XmlElement(name = "datoVedtakFagsystem") @JsonProperty("datoVedtakFagsystem")
    var datoVedtakFagsystem: LocalDate? = null,

    @XmlElement(name = "tilbakekrevingsPeriode") @JsonProperty("tilbakekrevingsPeriode")
    var tilbakekrevingsPeriode: List<DetaljertKravgrunnlagPeriodeDto>? = null
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