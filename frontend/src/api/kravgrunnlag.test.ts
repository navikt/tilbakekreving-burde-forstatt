import { tilEndreKravgrunnlagPerioder, tilLagreKravgrunnlagBody } from './kravgrunnlag';

const lagRespons = (overrides?: Record<string, unknown>): unknown => ({
    data: {
        perioder: [{ fom: '2026-06-08', tom: '2026-06-19', belopTilbakekreves: 5000 }],
    },
    status: 'SUKSESS',
    melding: 'Kravgrunnlag hentet',
    frontendFeilmelding: null,
    stacktrace: null,
    ...overrides,
});

describe('tilEndreKravgrunnlagPerioder', () => {
    test('mapper datoer og beløp til feilutbetalt', () => {
        const perioder = tilEndreKravgrunnlagPerioder(lagRespons());

        expect(perioder).toEqual([
            { datoFra: '2026-06-08', datoTil: '2026-06-19', feilutbetalt: '5000' },
        ]);
    });

    test('kaster feil med frontendFeilmelding når den er satt', () => {
        expect(() =>
            tilEndreKravgrunnlagPerioder(
                lagRespons({ data: null, frontendFeilmelding: 'Fant ikke kravgrunnlag' })
            )
        ).toThrow('Fant ikke kravgrunnlag');
    });

    test('kaster feil når responsen har ugyldig form', () => {
        expect(() => tilEndreKravgrunnlagPerioder({ uventet: true })).toThrow();
    });
});

describe('tilLagreKravgrunnlagBody', () => {
    test('sender datoer og feilutbetalt som belopTilbakekreves', () => {
        const body = tilLagreKravgrunnlagBody([
            { datoFra: '2026-06-08', datoTil: '2026-06-19', feilutbetalt: '5000' },
        ]);

        expect(body).toEqual({
            perioder: [{ fom: '2026-06-08', tom: '2026-06-19', belopTilbakekreves: 5000 }],
        });
    });

    test('tolker beløp med komma-desimal som tall', () => {
        const body = tilLagreKravgrunnlagBody([
            { datoFra: '2026-01-01', datoTil: '2026-01-31', feilutbetalt: '1500,50' },
        ]);

        expect(body.perioder[0].belopTilbakekreves).toBe(1500.5);
    });
});
