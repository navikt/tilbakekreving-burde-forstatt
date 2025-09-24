package no.nav.tilbakekreving.burdeforstatt.kontrakter

enum class Klassekoder(
    val ytelsesKlassekode: String,
    val feilutbetalingKlassekose: String,
) {
    BARNETRYGD(
        "BATR",
        "KL_KODE_FEIL_ARBYT",
    ),
    OVERGANGSSTØNAD(
        "EFOG",
        "KL_KODE_FEIL_ARBYT",
    ),
    BARNETILSYN(
        "EFBT",
        "KL_KODE_FEIL_ARBYT",
    ),
    SKOLEPENGER(
        "EFSP",
        "KL_KODE_FEIL_ARBYT",
    ),
    KONTANTSTØTTE(
        "KS",
        "KL_KODE_FEIL_ARBYT",
    ),
    TILLEGGSSTØNAD(
        "TSTBASISP4-OP",
        "KL_KODE_FEIL_ARBYT",
    ),
}
