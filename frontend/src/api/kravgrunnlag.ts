import type { EndreKravgrunnlagPeriode } from '../typer/endreKravgrunnlag';

import {
    kravgrunnlagResponsSchema,
    lagreKravgrunnlagResponsSchema,
} from '../typer/endreKravgrunnlag';

export const hentKravgrunnlagMutationKey = ['hentKravgrunnlag'] as const;

export type HentKravgrunnlagVariabler = {
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

const tilDatoArray = (dato: string): [number, number, number] => {
    const [år, måned, dag] = dato.split('-');
    return [Number(år), Number(måned), Number(dag)];
};

export const tilLagreKravgrunnlagBody = (
    perioder: EndreKravgrunnlagPeriode[]
): {
    perioder: {
        fom: [number, number, number];
        tom: [number, number, number];
        belopTilbakekreves: number;
    }[];
} => ({
    perioder: perioder.map(periode => ({
        fom: tilDatoArray(periode.datoFra),
        tom: tilDatoArray(periode.datoTil),
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
