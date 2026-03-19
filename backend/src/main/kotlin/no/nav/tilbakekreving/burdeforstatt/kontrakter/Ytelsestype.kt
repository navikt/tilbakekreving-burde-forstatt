package no.nav.tilbakekreving.burdeforstatt.kontrakter

enum class Ytelsestype(
    val kode: String,
    val navn: Map<Språkkode, String>,
) {
    BARNETRYGD(
        "BA",
        mapOf(
            Språkkode.NB to "Barnetrygd",
            Språkkode.NN to "Barnetrygd",
        ),
    ),
    OVERGANGSSTØNAD(
        "EFOG",
        mapOf(
            Språkkode.NB to "Overgangsstønad",
            Språkkode.NN to "Overgangsstønad",
        ),
    ),
    BARNETILSYN(
        "EFBT",
        mapOf(
            Språkkode.NB to "Stønad til barnetilsyn",
            Språkkode.NN to "Stønad til barnetilsyn",
        ),
    ),
    SKOLEPENGER(
        "EFSP",
        mapOf(
            Språkkode.NB to "Stønad til skolepenger",
            Språkkode.NN to "Stønad til skulepengar",
        ),
    ),
    KONTANTSTØTTE(
        "KS",
        mapOf(
            Språkkode.NB to "Kontantstøtte",
            Språkkode.NN to "Kontantstøtte",
        ),
    ),
    TILLEGGSSTØNAD(
        "TS",
        mapOf(
            Språkkode.NB to "Tilleggsstønad",
            Språkkode.NN to "Tilleggsstønad",
        ),
    ),
    BOLIG_OG_OVERNATTING(
        "TS",
        mapOf(
            Språkkode.NB to "Bolig og overordning",
            Språkkode.NN to "Bustad og overnatting",
        ),
    ),
    DAGLIG_REGISE(
        "TS",
        mapOf(
            Språkkode.NB to "Daglig regise",
            Språkkode.NN to "Dagleg reise",
        ),
    ),
    FLYTTING(
        "TS",
        mapOf(
            Språkkode.NB to "Flytting",
            Språkkode.NN to "Flytting",
        ),
    ),
    LÆREMIDLER(
        "TS",
        mapOf(
            Språkkode.NB to "Læremidler",
            Språkkode.NN to "Læremiddel",
        ),
    ),
    PASS_AV_BARN(
        "TS",
        mapOf(
            Språkkode.NB to "Barnepass",
            Språkkode.NN to "Barnepass",
        ),
    ),
    REISE_FOR_Å_KOMME_I_ARBEID(
        "TS",
        mapOf(
            Språkkode.NB to "Reise for å komme i arbeid",
            Språkkode.NN to "Reise for å kome i arbeid",
        ),
    ),
    REISE_VED_OPPSTART_AVSLUTNING_HJEMREISE(
        "TS",
        mapOf(
            Språkkode.NB to "Reise ved oppstart, avslutning eller hjemreise",
            Språkkode.NN to "Reise ved oppstart, avslutning eller heimreise",
        ),
    ),
    REISE_TIL_SAMLING(
        "TS",
        mapOf(
            Språkkode.NB to "Reise til samling",
            Språkkode.NN to "Reise til samling",
        ),
    ),

    ARBEIDSAVKLARINGSPENGER(
        "AAP",
        mapOf(
            Språkkode.NB to "Arbeidsavklaringspenger",
            Språkkode.NN to "Arbeidsavklaringspengar",
        ),
    ),
    TILTAKSPENGER(
        "TILTPENG",
        mapOf(
            Språkkode.NB to "Tiltakspenger",
            Språkkode.NN to "Tiltakspengar",
        ),
    ),
    ;

    fun tilTema(): Tema =
        when (this) {
            BARNETRYGD -> Tema.BAR
            BARNETILSYN, OVERGANGSSTØNAD, SKOLEPENGER -> Tema.ENF
            KONTANTSTØTTE -> Tema.KON
            TILLEGGSSTØNAD,
            BOLIG_OG_OVERNATTING,
            DAGLIG_REGISE,
            FLYTTING,
            LÆREMIDLER,
            PASS_AV_BARN,
            REISE_FOR_Å_KOMME_I_ARBEID,
            REISE_VED_OPPSTART_AVSLUTNING_HJEMREISE,
            REISE_TIL_SAMLING,
            -> Tema.TSO
            ARBEIDSAVKLARINGSPENGER -> Tema.AAP
            TILTAKSPENGER -> Tema.IND
        }

    fun tilKodeFagområdet(): String =
        when (this) {
            TILLEGGSSTØNAD -> "TILLST"
            BOLIG_OG_OVERNATTING -> "TILLSTBO"
            DAGLIG_REGISE -> "TILLSTDR"
            FLYTTING -> "TILLSTFL"
            LÆREMIDLER -> "TILLSTLM"
            PASS_AV_BARN -> "TILLSTPB"
            REISE_FOR_Å_KOMME_I_ARBEID -> "TILLSTRA"
            REISE_VED_OPPSTART_AVSLUTNING_HJEMREISE -> "TILLSTRO"
            REISE_TIL_SAMLING -> "TILLISTRS"
            else -> this.kode
        }

    fun tilKlassekoder(): Klassekoder =
        when (this) {
            BARNETRYGD -> Klassekoder.BARNETRYGD

            TILLEGGSSTØNAD,
            BOLIG_OG_OVERNATTING,
            DAGLIG_REGISE,
            FLYTTING,
            LÆREMIDLER,
            PASS_AV_BARN,
            REISE_FOR_Å_KOMME_I_ARBEID,
            REISE_VED_OPPSTART_AVSLUTNING_HJEMREISE,
            REISE_TIL_SAMLING,
            -> Klassekoder.TILLEGGSSTØNAD

            TILTAKSPENGER -> Klassekoder.TILTAKSPENGER
            ARBEIDSAVKLARINGSPENGER -> Klassekoder.ARBEIDSAVKLARINGSPENGER
            OVERGANGSSTØNAD -> Klassekoder.OVERGANGSSTØNAD
            BARNETILSYN -> Klassekoder.BARNETILSYN
            SKOLEPENGER -> Klassekoder.SKOLEPENGER
            KONTANTSTØTTE -> Klassekoder.KONTANTSTØTTE
        }
}
