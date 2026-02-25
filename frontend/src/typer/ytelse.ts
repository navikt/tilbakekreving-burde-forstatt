import { z } from 'zod';

export const ytelseSchema = z.enum(
    [
        'Overgangsstønad',
        'Barnetrygd',
        'Tilleggsstønad',
        'Kontantstøtte',
        'Arbeidsavklaringspenger',
        "BoligOgOvernatting",
        "DagligReise",
        "Flytting",
        "Læremidler",
        "PassAvBarn",
        "ReiseForÅKommeIArbeid",
        "ReiseVedOppstartAvslutningHjemreise",
        "ReiseTilSamling",
    ],
    {
        message: 'Ytelse er påkrevd',
    }
);
export type Ytelse = z.infer<typeof ytelseSchema>;

export const ytelseGrupper = [
    {
        fagsystem: 'Enslig forsørger',
        ytelser: [ytelseSchema.enum.Overgangsstønad],
    },
    {
        fagsystem: 'Barnetrygd',
        ytelser: [ytelseSchema.enum.Barnetrygd],
    },
    {
        fagsystem: 'Kontantstøtte',
        ytelser: [ ytelseSchema.enum.Kontantstøtte],
    },
    {
        fagsystem: 'Tilleggsstønad',
        ytelser: [ytelseSchema.enum.Tilleggsstønad],
    },
    {
        fagsystem: 'Tilleggsstønad',
        ytelser: [ytelseSchema.enum.BoligOgOvernatting],
    },
    {
        fagsystem: 'Tilleggsstønad',
        ytelser: [ytelseSchema.enum.DagligReise],
    },
    {
        fagsystem: 'Tilleggsstønad',
        ytelser: [ytelseSchema.enum.Flytting],
    },
    {
        fagsystem: 'Tilleggsstønad',
        ytelser: [ytelseSchema.enum.Læremidler],
    },
    {
        fagsystem: 'Tilleggsstønad',
        ytelser: [ytelseSchema.enum.PassAvBarn],
    },
    {
        fagsystem: 'Tilleggsstønad',
        ytelser: [ytelseSchema.enum.ReiseForÅKommeIArbeid],
    },
    {
        fagsystem: 'Tilleggsstønad',
        ytelser: [ytelseSchema.enum.ReiseVedOppstartAvslutningHjemreise],
    },
    {
        fagsystem: 'Tilleggsstønad',
        ytelser: [ytelseSchema.enum.ReiseTilSamling],
    },

    {
        fagsystem: 'Arbeidsavklaringspenger',
        ytelser: [ytelseSchema.enum.Arbeidsavklaringspenger],
    },
] as const;

export const månedsytelser = [
    ytelseSchema.enum.Overgangsstønad,
    ytelseSchema.enum.Barnetrygd,
    ytelseSchema.enum.Kontantstøtte,
] as const;

export const datoYtelser = [
    ytelseSchema.enum.Tilleggsstønad,
    ytelseSchema.enum.Arbeidsavklaringspenger,
    ytelseSchema.enum.BoligOgOvernatting,
    ytelseSchema.enum.DagligReise,
    ytelseSchema.enum.Flytting,
    ytelseSchema.enum.Læremidler,
    ytelseSchema.enum.PassAvBarn,
    ytelseSchema.enum.ReiseForÅKommeIArbeid,
    ytelseSchema.enum.ReiseVedOppstartAvslutningHjemreise,
    ytelseSchema.enum.ReiseTilSamling,
] as const;
