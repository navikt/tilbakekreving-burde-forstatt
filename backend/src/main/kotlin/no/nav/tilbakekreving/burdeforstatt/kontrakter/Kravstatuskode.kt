package no.nav.tilbakekreving.burdeforstatt.kontrakter

enum class Kravstatuskode(
    val oppdragKode: String,
    val navn: String,
) {
    NY("NY", "Nytt kravgrunnlag"),
    ENDRET("ENDR", "Endret kravgrunnlag"),
    ANNULERT("ANNU", "Kravgrunnlag annullert"),
}
