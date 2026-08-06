package no.nav.tilbakekreving.burdeforstatt.kontrakter

import no.nav.tilbakekreving.burdeforstatt.Periodetype

enum class Ytelsestype(
    val kode: String,
    val navn: Map<Språkkode, String>,
    val periodetype: Periodetype,
) {
    BARNETRYGD(
        "BA",
        mapOf(
            Språkkode.NB to "Barnetrygd",
            Språkkode.NN to "Barnetrygd",
        ),
        Periodetype.Måned,
    ),
    OVERGANGSSTØNAD(
        "EFOG",
        mapOf(
            Språkkode.NB to "Overgangsstønad",
            Språkkode.NN to "Overgangsstønad",
        ),
        Periodetype.Måned,
    ),
    BARNETILSYN(
        "EFBT",
        mapOf(
            Språkkode.NB to "Stønad til barnetilsyn",
            Språkkode.NN to "Stønad til barnetilsyn",
        ),
        Periodetype.Måned,
    ),
    SKOLEPENGER(
        "EFSP",
        mapOf(
            Språkkode.NB to "Stønad til skolepenger",
            Språkkode.NN to "Stønad til skulepengar",
        ),
        Periodetype.Måned,
    ),
    KONTANTSTØTTE(
        "KS",
        mapOf(
            Språkkode.NB to "Kontantstøtte",
            Språkkode.NN to "Kontantstøtte",
        ),
        Periodetype.Måned,
    ),
    TILLEGGSSTØNAD(
        "TS",
        mapOf(
            Språkkode.NB to "Tilleggsstønad",
            Språkkode.NN to "Tilleggsstønad",
        ),
        Periodetype.Meldekort,
    ),
    BOLIG_OG_OVERNATTING(
        "TS",
        mapOf(
            Språkkode.NB to "Bolig og overordning",
            Språkkode.NN to "Bustad og overnatting",
        ),
        Periodetype.Meldekort,
    ),
    DAGLIG_REGISE(
        "TS",
        mapOf(
            Språkkode.NB to "Daglig regise",
            Språkkode.NN to "Dagleg reise",
        ),
        Periodetype.Meldekort,
    ),
    FLYTTING(
        "TS",
        mapOf(
            Språkkode.NB to "Flytting",
            Språkkode.NN to "Flytting",
        ),
        Periodetype.Meldekort,
    ),
    LÆREMIDLER(
        "TS",
        mapOf(
            Språkkode.NB to "Læremidler",
            Språkkode.NN to "Læremiddel",
        ),
        Periodetype.Meldekort,
    ),
    PASS_AV_BARN(
        "TS",
        mapOf(
            Språkkode.NB to "Barnepass",
            Språkkode.NN to "Barnepass",
        ),
        Periodetype.Meldekort,
    ),
    REISE_FOR_Å_KOMME_I_ARBEID(
        "TS",
        mapOf(
            Språkkode.NB to "Reise for å komme i arbeid",
            Språkkode.NN to "Reise for å kome i arbeid",
        ),
        Periodetype.Meldekort,
    ),
    REISE_VED_OPPSTART_AVSLUTNING_HJEMREISE(
        "TS",
        mapOf(
            Språkkode.NB to "Reise ved oppstart, avslutning eller hjemreise",
            Språkkode.NN to "Reise ved oppstart, avslutning eller heimreise",
        ),
        Periodetype.Meldekort,
    ),
    REISE_TIL_SAMLING(
        "TS",
        mapOf(
            Språkkode.NB to "Reise til samling",
            Språkkode.NN to "Reise til samling",
        ),
        Periodetype.Meldekort,
    ),

    ARBEIDSAVKLARINGSPENGER(
        "AAP",
        mapOf(
            Språkkode.NB to "Arbeidsavklaringspenger",
            Språkkode.NN to "Arbeidsavklaringspengar",
        ),
        Periodetype.Meldekort,
    ),
    TILTAKSPENGER(
        "TP",
        mapOf(
            Språkkode.NB to "Tiltakspenger",
            Språkkode.NN to "Tiltakspengar",
        ),
        Periodetype.Meldekort,
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
            TILTAKSPENGER -> "TILTPENG"
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

            ARBEIDSAVKLARINGSPENGER -> Klassekoder.ARBEIDSAVKLARINGSPENGER
            TILTAKSPENGER -> Klassekoder.TILTAKSPENGER
            OVERGANGSSTØNAD -> Klassekoder.OVERGANGSSTØNAD
            BARNETILSYN -> Klassekoder.BARNETILSYN
            SKOLEPENGER -> Klassekoder.SKOLEPENGER
            KONTANTSTØTTE -> Klassekoder.KONTANTSTØTTE
        }

    companion object {
        fun tilYtelsestype(kode: String): Ytelsestype =
            when (kode) {
                "BA" -> BARNETRYGD
                "EFOG" -> OVERGANGSSTØNAD
                "EFBT" -> BARNETILSYN
                "EFSP" -> SKOLEPENGER
                "KS" -> KONTANTSTØTTE
                "TS" -> TILLEGGSSTØNAD
                "AAP" -> ARBEIDSAVKLARINGSPENGER
                "TP" -> TILTAKSPENGER
                else -> {
                    throw IllegalArgumentException("Ukjent ytelsestype: $kode")
                }
            }
    }
}

/*
* TILLSTBO – Tilleggsstønad, bolig og overnatting
* TILLSTDR – Tilleggsstønad, daglig reise
* TILLSTFL – Tilleggsstønad, flytting
* TILLSTLM – Tilleggsstønad, læremidler
* TILLSTPB – Tilleggsstønad pass av barn
* TILLSTRA – Tilleggsstønad, reise for å komme i arbeid
* TILLSTRO – Tilleggsstønad, reise oppst., avsl.hjem
* TILLISTRS-Tilleggsstønad, reise til samling
 * */
