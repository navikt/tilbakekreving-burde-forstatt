import { tilEndreKravgrunnlagPerioder } from './kravgrunnlag';

const lagRespons = (overrides?: Record<string, unknown>): unknown => ({
    data: {
        perioder: [{ fom: [2026, 6, 8], tom: [2026, 6, 19], belopTilbakekreves: 5000 }],
        kravstatuskode: 'NY',
    },
    status: 'SUKSESS',
    melding: 'Kravgrunnlag hentet',
    frontendFeilmelding: null,
    stacktrace: null,
    ...overrides,
});

describe('tilEndreKravgrunnlagPerioder', () => {
    test('mapper datoarrayer til yyyy-MM-dd og beløp til feilutbetalt', () => {
        const perioder = tilEndreKravgrunnlagPerioder(lagRespons());

        expect(perioder).toEqual([
            { datoFra: '2026-06-08', datoTil: '2026-06-19', feilutbetalt: '5000' },
        ]);
    });

    test('padder måned og dag med ledende null', () => {
        const perioder = tilEndreKravgrunnlagPerioder(
            lagRespons({
                data: {
                    perioder: [{ fom: [2026, 1, 3], tom: [2026, 12, 31], belopTilbakekreves: 1 }],
                    kravstatuskode: 'NY',
                },
            })
        );

        expect(perioder[0].datoFra).toBe('2026-01-03');
        expect(perioder[0].datoTil).toBe('2026-12-31');
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
