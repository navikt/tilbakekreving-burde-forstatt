import { z } from 'zod';

import { periodeSchema } from './periode';
import { personIdentSchema } from './personIdent';
import { ytelseSchema } from './ytelse';

export const tilbakeFormDataSchema = z.object({
    perioder: z.array(periodeSchema).min(1, { message: 'Du må legge til minst én periode' }),
    sendKravgrunnlag: z.boolean(),
    ytelse: ytelseSchema,
    personIdent: personIdentSchema,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const tilbakeRequest = z.object({
    perioder: z.array(
        z.object({
            fom: z.string(),
            tom: z.string(),
            simulertBelop: z.number(),
            kravgrunnlagBelop: z.number(),
        })
    ),
    sendKravgrunnlag: z.boolean(),
    ytelse: ytelseSchema,
    personIdent: personIdentSchema,
});

export type TilbakeFormData = z.infer<typeof tilbakeFormDataSchema>;
export type TilbakeRequest = z.infer<typeof tilbakeRequest>;
