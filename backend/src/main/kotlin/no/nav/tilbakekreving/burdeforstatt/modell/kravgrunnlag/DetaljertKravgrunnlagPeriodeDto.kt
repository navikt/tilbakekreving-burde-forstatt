package no.nav.tilbakekreving.burdeforstatt.modell.kravgrunnlag

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.xml.bind.annotation.XmlAccessType
import jakarta.xml.bind.annotation.XmlAccessorType
import jakarta.xml.bind.annotation.XmlElement
import jakarta.xml.bind.annotation.XmlRootElement
import java.math.BigDecimal
import java.time.LocalDate

@XmlRootElement(name = "DetaljertKravgrunnlagPeriodeDto")
@XmlAccessorType(XmlAccessType.FIELD)
data class DetaljertKravgrunnlagPeriodeDto(

    @XmlElement(name = "periode")
    @JsonProperty("periode")
    var periode: PeriodeDto? = null,
    @XmlElement(name = "belopSkattMnd")
    @JsonProperty("belopSkattMnd")
    var belopSkattMnd: BigDecimal? = null,
    @XmlElement(name = "tilbakekrevingsBelop")
    @JsonProperty("tilbakekrevingsBelop")
    var tilbakekrevingsBelop: List<DetaljertKravgrunnlagBelopDto>? = null,
    )

@XmlRootElement(name = "DetaljertKravgrunnlagBelopDto")
@XmlAccessorType(XmlAccessType.FIELD)
data class DetaljertKravgrunnlagBelopDto(

    @XmlElement(name = "kodeKlasse")
    @JsonProperty("kodeKlasse")
    var kodeKlasse: String? = null,
    @XmlElement(name = "typeKlasse")
    @JsonProperty("typeKlasse")
    var typeKlasse: TypeKlasseDto? = null,
    @XmlElement(name = "belopOpprUtbet")
    @JsonProperty("belopOpprUtbet")
    var belopOpprUtbet: BigDecimal? = null,
    @XmlElement(name = "belopNy")
    @JsonProperty("belopNy")
    var belopNy: BigDecimal? = null,
    @XmlElement(name = "belopTilbakekreves")
    @JsonProperty("belopTilbakekreves")
    var belopTilbakekreves: BigDecimal? = null,
    @XmlElement(name = "belopUinnkrevd")
    @JsonProperty("belopUinnkrevd")
    var belopUinnkrevd: BigDecimal? = null,
    @XmlElement(name = "skattProsent")
    @JsonProperty("skattProsent")
    var skattProsent: BigDecimal? = null,
    @XmlElement(name = "kodeResultat")
    @JsonProperty("kodeResultat")
    var kodeResultat: String? = null,
    @XmlElement(name = "kodeAArsak")
    @JsonProperty("kodeAArsak")
    var kodeAArsak: String? = null,
    @XmlElement(name = "kodeSkyld")
    @JsonProperty("kodeSkyld")
    var kodeSkyld: String? = null,
)

@XmlRootElement(name = "PeriodeDto")
@XmlAccessorType(XmlAccessType.FIELD)
data class PeriodeDto (
    @XmlElement(name = "fom")
    @JsonProperty("fom")
    var fom: LocalDate? = null,
    @XmlElement(name = "tom")
    @JsonProperty("tom")
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