package no.nav.tilbakekreving.burdeforstatt.kontrakter

enum class Klassekoder(
    val ytelsesKlassekode: String,
    val feilutbetalingKlassekose: String,
) {
    BARNETRYGD(
        "BATR",
        "BATR",
        // "KL_KODE_FEIL_ARBYT",
    ),
    OVERGANGSSTØNAD(
        "EFOG",
        "EFOG",
        // "KL_KODE_FEIL_ARBYT",
    ),
    BARNETILSYN(
        "EFBT",
        "EFBT",
        // "KL_KODE_FEIL_ARBYT",
    ),
    SKOLEPENGER(
        "EFSP",
        "EFSP",
        // "KL_KODE_FEIL_ARBYT",
    ),
    KONTANTSTØTTE(
        "KS",
        "KS",
        // "KL_KODE_FEIL_ARBYT",
    ),
    TILLEGGSSTØNAD(
        "TSTBASISP4-OP",
        "KL_KODE_FEIL_ARBYT",
    ),
}
