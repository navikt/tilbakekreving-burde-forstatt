package no.nav.tilbakekreving.burdeforstatt.modell.kravgrunnlag

import com.fasterxml.jackson.annotation.JsonProperty
import java.math.BigDecimal
import java.time.LocalDate

data class DetaljertKravgrunnlagPeriodeDto(

    @JsonProperty("periode") var periode: PeriodeDto? = null,
    @JsonProperty("belopSkattMnd") var belopSkattMnd: BigDecimal? = null,
    @JsonProperty("tilbakekrevingsBelop") var tilbakekrevingsBelop: List<DetaljertKravgrunnlagBelopDto>? = null,
    )

data class DetaljertKravgrunnlagBelopDto(

    @JsonProperty("kodeKlasse") var kodeKlasse: String? = null,
    @JsonProperty("typeKlasse") var typeKlasse: TypeKlasseDto? = null,
    @JsonProperty("belopOpprUtbet") var belopOpprUtbet: BigDecimal? = null,
    @JsonProperty("belopNy") var belopNy: BigDecimal? = null,
    @JsonProperty("belopTilbakekreves") var belopTilbakekreves: BigDecimal? = null,
    @JsonProperty("belopUinnkrevd") var belopUinnkrevd: BigDecimal? = null,
    @JsonProperty("skattProsent") var skattProsent: BigDecimal? = null,
    @JsonProperty("kodeResultat") var kodeResultat: String? = null,
    @JsonProperty("kodeAArsak") var kodeAArsak: String? = null,
    @JsonProperty("kodeSkyld") var kodeSkyld: String? = null,
)

data class PeriodeDto (
    @JsonProperty("fom") var fom: LocalDate? = null,
    @JsonProperty("tom") var tom: LocalDate? = null,
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