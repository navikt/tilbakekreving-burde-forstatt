package no.nav.tilbakekreving.burdeforstatt.kontrakter

enum class Behandlingstype(
    val visningsnavn: String,
) {
    TILBAKEKREVING("Tilbakekreving"),
    REVURDERING_TILBAKEKREVING("Tilbakekreving revurdering"),
}
