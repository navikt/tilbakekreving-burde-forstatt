import type { EndreKravgrunnlagPeriode } from '../typer/endreKravgrunnlag';

import {
    kravgrunnlagResponsSchema,
    lagreKravgrunnlagResponsSchema,
} from '../typer/endreKravgrunnlag';

export const hentKravgrunnlagMutationKey = ['hentKravgrunnlag'] as const;

export type HentKravgrunnlagVariabler = {
    eksternFagsystemId: string;
};

export const tilEndreKravgrunnlagPerioder = (json: unknown): EndreKravgrunnlagPeriode[] => {
    const respons = kravgrunnlagResponsSchema.parse(json);

    if (respons.frontendFeilmelding) {
        throw new Error(respons.frontendFeilmelding);
    }

    if (!respons.data) {
        throw new Error('Kravgrunnlaget mangler data');
    }

    return respons.data.perioder.map(periode => ({
        datoFra: periode.fom,
        datoTil: periode.tom,
        feilutbetalt: String(periode.belopTilbakekreves),
    }));
};

export const hentKravgrunnlagFraApi = async ({
    eksternFagsystemId,
}: HentKravgrunnlagVariabler): Promise<EndreKravgrunnlagPeriode[]> => {
    const encodedEksternFagsystemId = encodeURIComponent(eksternFagsystemId.trim());

    const response = await fetch(`/api/kravgrunnlag/${encodedEksternFagsystemId}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`Klarte ikke hente kravgrunnlag (status ${response.status})`);
    }

    return tilEndreKravgrunnlagPerioder(await response.json());
};

export const lagreKravgrunnlagMutationKey = ['lagreKravgrunnlag'] as const;

export type LagreKravgrunnlagVariabler = {
    eksternFagsystemId: string;
    perioder: EndreKravgrunnlagPeriode[];
};

export const tilLagreKravgrunnlagBody = (
    perioder: EndreKravgrunnlagPeriode[]
): {
    perioder: {
        fom: string;
        tom: string;
        belopTilbakekreves: number;
    }[];
} => ({
    perioder: perioder.map(periode => ({
        fom: periode.datoFra,
        tom: periode.datoTil,
        belopTilbakekreves: Number(periode.feilutbetalt.replace(',', '.')),
    })),
});

export const tilBehandlingUrl = (json: unknown): string | undefined => {
    const respons = lagreKravgrunnlagResponsSchema.safeParse(json);
    return respons.success ? (respons.data.data ?? undefined) : undefined;
};

export const lagreKravgrunnlag = async ({
    eksternFagsystemId,
    perioder,
}: LagreKravgrunnlagVariabler): Promise<string | undefined> => {
    const encodedEksternFagsystemId = encodeURIComponent(eksternFagsystemId.trim());

    const response = await fetch(`/api/kravgrunnlag/${encodedEksternFagsystemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify(tilLagreKravgrunnlagBody(perioder)),
    });

    if (!response.ok) {
        throw new Error(`Klarte ikke lagre kravgrunnlag (status ${response.status})`);
    }

    return tilBehandlingUrl(await response.json().catch(() => null));
};
