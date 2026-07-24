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

const kravgrunnlagDatoSchema = z.tuple([z.number(), z.number(), z.number()]);

export const kravgrunnlagResponsSchema = z.object({
    data: z
        .object({
            perioder: z
                .array(
                    z.object({
                        fom: kravgrunnlagDatoSchema,
                        tom: kravgrunnlagDatoSchema,
                        belopTilbakekreves: z.number(),
                    })
                )
                .min(1, { message: 'Kravgrunnlaget inneholder ingen perioder' }),
        })
        .nullable(),
    status: z.string(),
    melding: z.string(),
    frontendFeilmelding: z.string().nullable(),
    stacktrace: z.string().nullable(),
});

export type KravgrunnlagRespons = z.infer<typeof kravgrunnlagResponsSchema>;
