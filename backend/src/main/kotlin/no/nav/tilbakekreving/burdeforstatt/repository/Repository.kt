package no.nav.tilbakekreving.burdeforstatt.repository

import no.nav.tilbakekreving.burdeforstatt.entities.TidligereInnsendtKrav
import no.nav.tilbakekreving.status.v1.KravOgVedtakstatus
import java.math.BigInteger

interface Repository {
    suspend fun lagre(tidligereInnsendtKrav: TidligereInnsendtKrav)

    suspend fun lager(
        kravgrunnlagId: BigInteger,
        kravOgVedtakstatus: KravOgVedtakstatus,
    )

    suspend fun hent(fagsystemId: String): TidligereInnsendtKrav?
}
