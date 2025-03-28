import { z } from "zod";
import { periodeSchema } from "./periode";
import { ytelseSchema } from "./ytelse";
import { personIdentSchema } from "./personIdent";

export const tilbakeFormDataSchema = z.object({
  perioder: z.array(periodeSchema).refine((perioder) => perioder.length > 0, {
    message: "Du må legge til minst én periode",
  }),
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
  ytelse: ytelseSchema,
  personIdent: personIdentSchema,
});

export type TilbakeFormData = z.infer<typeof tilbakeFormDataSchema>;
export type TilbakeRequest = z.infer<typeof tilbakeRequest>;
