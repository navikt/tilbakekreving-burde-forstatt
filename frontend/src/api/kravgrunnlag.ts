import type { EndreKravgrunnlagPeriode } from '../typer/endreKravgrunnlag';

import { kravgrunnlagResponsSchema } from '../typer/endreKravgrunnlag';

export const hentKravgrunnlagMutationKey = ['hentKravgrunnlag'] as const;

export type HentKravgrunnlagVariabler = {
    ytelse: string;
    eksternFagsystemId: string;
};

const tilDatoStreng = ([år, måned, dag]: [number, number, number]): string =>
    `${år}-${String(måned).padStart(2, '0')}-${String(dag).padStart(2, '0')}`;

export const tilEndreKravgrunnlagPerioder = (json: unknown): EndreKravgrunnlagPeriode[] => {
    const respons = kravgrunnlagResponsSchema.parse(json);

    if (respons.frontendFeilmelding) {
        throw new Error(respons.frontendFeilmelding);
    }

    if (!respons.data) {
        throw new Error('Kravgrunnlaget mangler data');
    }

    return respons.data.perioder.map(periode => ({
        datoFra: tilDatoStreng(periode.fom),
        datoTil: tilDatoStreng(periode.tom),
        feilutbetalt: String(periode.belopTilbakekreves),
    }));
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

    return tilEndreKravgrunnlagPerioder(await response.json());
};
