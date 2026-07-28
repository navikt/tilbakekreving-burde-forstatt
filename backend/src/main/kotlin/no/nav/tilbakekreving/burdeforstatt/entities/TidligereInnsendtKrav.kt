package no.nav.tilbakekreving.burdeforstatt.entities

import no.nav.tilbakekreving.typer.v1.TypeGjelderDto
import java.math.BigDecimal
import java.math.BigInteger
import java.time.LocalDate

data class TidligereInnsendtKrav(
    val kravgrunnlagId: BigInteger,
    val vedtakId: BigInteger,
    val kodeFagomraade: String,
    val fagsystemId: String,
    val vedtakIdOmgjort: BigInteger,
    val vedtakGjelderId: String,
    val typeGjelderId: TypeGjelderDto,
    val utbetalesTilId: String,
    val typeUtbetId: TypeGjelderDto,
    val enhetAnsvarlig: String,
    val enhetBosted: String,
    val enhetBehandl: String,
    val saksbehId: String,
    val tilbakekrevingsPeriode: List<TidligereInnsendtKravPeriode>,
)

data class TidligereInnsendtKravPeriode(
    val fom: LocalDate,
    val tom: LocalDate,
    val belopTilbakekreves: BigDecimal,
)
