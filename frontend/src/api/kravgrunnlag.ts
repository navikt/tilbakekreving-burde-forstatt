import type { EndreKravgrunnlagPeriode } from '../typer/endreKravgrunnlag';

import { kravgrunnlagResponsSchema } from '../typer/endreKravgrunnlag';

export const hentKravgrunnlagMutationKey = ['hentKravgrunnlag'] as const;

export type HentKravgrunnlagVariabler = {
    ytelse: string;
    eksternFagsystemId: string;
};

export const hentKravgrunnlagFraApi = async ({
    ytelse,
    eksternFagsystemId,
}: HentKravgrunnlagVariabler): Promise<EndreKravgrunnlagPeriode[]> => {
    const encodedYtelse = encodeURIComponent(ytelse.trim());
    const encodedEksternFagsystemId = encodeURIComponent(eksternFagsystemId.trim());

    const response = await fetch(
        `/api/kravgrunnlag/${encodedYtelse}/${encodedEksternFagsystemId}`,
        {
            method: 'GET',
            headers: { Accept: 'application/json' },
            credentials: 'include',
        }
    );

    if (!response.ok) {
        throw new Error(`Klarte ikke hente kravgrunnlag (status ${response.status})`);
    }

    const data = kravgrunnlagResponsSchema.parse(await response.json());

    return data.perioder.map(periode => ({
        datoFra: periode.fom,
        datoTil: periode.tom,
        feilutbetalt: String(periode.belop),
    }));
};
