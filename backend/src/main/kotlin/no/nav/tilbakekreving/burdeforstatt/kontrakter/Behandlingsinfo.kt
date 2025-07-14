package no.nav.tilbakekreving.burdeforstatt.kontrakter

import java.math.BigInteger
import java.time.LocalDateTime
import java.util.UUID

data class Behandlingsinfo(
    val eksternKravgrunnlagId: BigInteger?,
    val kravgrunnlagId: UUID?,
    val kravgrunnlagKravstatuskode: String?,
    val eksternId: String,
    val opprettetTid: LocalDateTime,
    val behandlingId: UUID?,
    val behandlingstatus: Behandlingsstatus?,
)

enum class Behandlingsstatus(
    val kode: String,
) {
    AVSLUTTET("AVSLU"),
    FATTER_VEDTAK("FVED"),
    IVERKSETTER_VEDTAK("IVED"),
    OPPRETTET("OPPRE"),
    UTREDES("UTRED"),
}
