package no.nav.tilbakekreving.burdeforstatt.repository

import no.nav.tilbakekreving.burdeforstatt.entities.TidligereInnsendtKrav

interface Repository {
    suspend fun lagre(tidligereInnsendtKrav: TidligereInnsendtKrav)

    suspend fun hent(fagsystemId: String): TidligereInnsendtKrav?
}
