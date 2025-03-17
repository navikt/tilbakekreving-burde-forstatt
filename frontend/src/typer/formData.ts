import { z } from "zod";
import { periodeSchema } from "./periode";
import { ytelseSchema } from "./ytelse";
import { personIdentSchema } from "./ident";
import { beløpSchema } from "./beløp";

export const tilbakeFormDataRequestSchema = z.object({
  perioder: z.array(periodeSchema).refine((perioder) => perioder.length > 0, {
    message: "Du må legge til minst én periode",
  }),
  ytelse: ytelseSchema,
  personIdent: personIdentSchema,
  simulertBeløp: beløpSchema,
  kravgrunnlagBeløp: beløpSchema,
});

export type TilbakeFormDataRequest = z.infer<
  typeof tilbakeFormDataRequestSchema
>;
