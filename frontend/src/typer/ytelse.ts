import { z } from 'zod';

export const ytelseSchema = z.enum(
    ['Overgangsstønad', 'Barnetrygd', 'Tilleggsstønad' , 'Kontantstøtte', 'Arbeidsavklaringspenger'],
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
    ytelseSchema.enum.Arbeidsavklaringspenger
] as const;
