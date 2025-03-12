package no.nav.tilbakekreving.burdeforstatt.modell.kravgrunnlag

import java.math.BigInteger
import java.security.SecureRandom
import java.time.LocalDate

data class DetaljertKravgrunnlagDto(
    var kravgrunnlagId: BigInteger? = randomBigInteger(),
    protected var vedtakId: BigInteger? = randomBigInteger(),
    protected var kodeStatusKrav: String? = null,
    protected var kodeFagomraade: String? = null,
    protected var fagsystemId: String? = null,
    protected var datoVedtakFagsystem: LocalDate? = null,
    protected var vedtakIdOmgjort: BigInteger? = null,
    protected var vedtakGjelderId: String? = null,
    protected var typeGjelderId: TypeGjelderDto? = null,
    protected var utbetalesTilId: String? = null,
    protected var typeUtbetId: TypeGjelderDto? = null,
    protected var kodeHjemmel: String? = null,
    protected var renterBeregnes: JaNeiDto? = null,
    protected var enhetAnsvarlig: String? = null,
    protected var enhetBosted: String? = null,
    protected var enhetBehandl: String? = null,
    protected var kontrollfelt: String? = null,
    protected var saksbehId: String? = null,
    protected var referanse: String? = null,
    var tilbakekrevingsPeriode: List<DetaljertKravgrunnlagPeriodeDto>? = null,
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