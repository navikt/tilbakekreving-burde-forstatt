package no.nav.tilbakekreving.burdeforstatt.modell.kravgrunnlag

import java.math.BigDecimal
import java.time.LocalDate

data class DetaljertKravgrunnlagPeriodeDto(

    protected var periode: PeriodeDto? = null,
    protected var belopSkattMnd: BigDecimal? = null,
    protected var tilbakekrevingsBelop: List<DetaljertKravgrunnlagBelopDto>? = null,
    )

data class DetaljertKravgrunnlagBelopDto(

    protected var kodeKlasse: String? = null,
    protected var typeKlasse: TypeKlasseDto? = null,
    protected var belopOpprUtbet: BigDecimal? = null,
    protected var belopNy: BigDecimal? = null,
    protected var belopTilbakekreves: BigDecimal? = null,
    protected var belopUinnkrevd: BigDecimal? = null,
    protected var skattProsent: BigDecimal? = null,
    protected var kodeResultat: String? = null,
    protected var kodeAArsak: String? = null,
    protected var kodeSkyld: String? = null,
)

data class PeriodeDto (
    var fom: LocalDate? = null,
    var tom: LocalDate? = null,
)

enum class TypeKlasseDto {
    FEIL,
    JUST,
    SKAT,
    TREK,
    YTEL;

    fun value(): String {
        return this.name
    }

    companion object {
        fun fromValue(v: String): TypeKlasseDto {
            return TypeKlasseDto.valueOf(v)
        }
    }
}