package no.nav.tilbakekreving.burdeforstatt.kontrakter

import com.fasterxml.jackson.annotation.JsonProperty


data class Brevmottaker(
    @JsonProperty("type") val type: MottakerType,
    @JsonProperty("vergetype") val vergetype: Vergetype? = null,
    @JsonProperty("navn") val navn: String,
    @JsonProperty("organisasjonsnummer") val organisasjonsnummer: String? = null,
    @JsonProperty("personIdent") val personIdent: String? = null,
    @JsonProperty("manuellAdresseInfo") val manuellAdresseInfo: ManuellAdresseInfo? = null,
) {
    init {
        check(!(manuellAdresseInfo == null && personIdent.isNullOrBlank() && organisasjonsnummer.isNullOrBlank())) {
            "Må ha enten manuellAdresseInfo, personIdent eller et organisasjonsnummer."
        }
        if (type == MottakerType.VERGE || type == MottakerType.FULLMEKTIG) {
            checkNotNull(vergetype) {
                "Vergetype kan ikke være null for brevmottakere av type verge og fullmektig."
            }
        }
    }
}

enum class MottakerType(
    val visningsnavn: String,
) {
    BRUKER_MED_UTENLANDSK_ADRESSE("Bruker med utenlandsk adresse"),
    FULLMEKTIG("Fullmektig"),
    VERGE("Verge"),
    DØDSBO("Dødsbo"),
}

data class ManuellAdresseInfo(
    @JsonProperty("adresselinje1") val adresselinje1: String,
    @JsonProperty("adresselinje2") val adresselinje2: String? = null,
    @JsonProperty("postnummer") val postnummer: String,
    @JsonProperty("poststed") val poststed: String,
    @JsonProperty("landkode") val landkode: String,
)
