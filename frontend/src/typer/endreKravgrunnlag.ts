import { z } from 'zod';

import { beløpSchema } from './belop';

export const endreKravgrunnlagPeriodeSchema = z.object({
    datoFra: z.string().min(1, { message: 'Dato fra er påkrevd' }),
    datoTil: z.string().min(1, { message: 'Dato til er påkrevd' }),
    feilutbetalt: beløpSchema,
});

export const endreKravgrunnlagSchema = z.object({
    eksternFagsystemId: z.string().min(1, { message: 'Ekstern fagsystem id er påkrevd' }),
    ytelse: z.string().min(1, { message: 'Ytelsestype er påkrevd' }),
    perioder: z
        .array(endreKravgrunnlagPeriodeSchema)
        .min(1, { message: 'Du må legge til minst én periode' }),
});

export type EndreKravgrunnlagPeriode = z.infer<typeof endreKravgrunnlagPeriodeSchema>;
export type EndreKravgrunnlagFormData = z.infer<typeof endreKravgrunnlagSchema>;

export type DatoAlternativ = {
    value: string;
    label: string;
};
