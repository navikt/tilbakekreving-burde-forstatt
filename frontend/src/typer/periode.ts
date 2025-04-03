import { z } from "zod";
import { beløpSchema } from "./belop";

const sluttenAvIDag = new Date();
sluttenAvIDag.setHours(23, 59, 59, 999);

export const periodeSchema = z.object({
  fom: z
    .date({
      required_error: "Fra dato er påkrevd",
      invalid_type_error: "Fra dato må være en dato",
    })
    .refine((date) => date <= sluttenAvIDag, {
      message: "Fra-dato kan ikke være i fremtiden",
    }),
  tom: z
    .date({
      required_error: "Til dato er påkrevd",
      invalid_type_error: "Til dato må være en dato",
    })
    .refine((date) => date <= sluttenAvIDag, {
      message: "Til-dato kan ikke være i fremtiden",
    }),
  simulertBeløp: beløpSchema,
  kravgrunnlagBeløp: beløpSchema,
});

export type Periode = z.infer<typeof periodeSchema>;
