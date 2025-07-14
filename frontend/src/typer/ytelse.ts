import { z } from 'zod';

export const ytelseSchema = z.enum(['Overgangsstønad', 'Barnetrygd' /*, 'Kontantstøtte'*/, 'Tilleggsstønad'], {
    message: 'Ytelse er påkrevd',
});
export type Ytelse = z.infer<typeof ytelseSchema>;

export const ytelseGrupper = [
    {
        fagsystem: 'Enslig forsørger',
        ytelser: [ytelseSchema.enum.Overgangsstønad],
    },
    {
        fagsystem: 'Barnetrygd og kontantstøtte',
        ytelser: [ytelseSchema.enum.Barnetrygd /*, ytelseSchema.enum.Kontantstøtte*/],
    },
    {
        fagsystem: 'Tilleggsstønad',
        ytelser: [ytelseSchema.enum.Tilleggsstønad],
    },
] as const;

export const månedsytelser = [
    ytelseSchema.enum.Overgangsstønad,
    ytelseSchema.enum.Barnetrygd,
    ytelseSchema.enum.Tilleggsstønad,
    /*ytelseSchema.enum.Kontantstøtte,*/
];
