package no.nav.tilbakekreving.burdeforstatt.kontrakter


data class Brevmottaker(
    val type: MottakerType,
    val vergetype: Vergetype? = null,
    val navn: String,
    val organisasjonsnummer: String? = null,
    val personIdent: String? = null,
    val manuellAdresseInfo: ManuellAdresseInfo? = null,
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
    val adresselinje1: String,
    val adresselinje2: String? = null,
    val postnummer: String,
    val poststed: String,
    val landkode: String,
)
