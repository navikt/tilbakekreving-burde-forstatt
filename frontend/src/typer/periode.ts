import { z } from "zod";

import { beløpSchema } from "./belop";

const sluttenAvIDag = new Date();
sluttenAvIDag.setHours(23, 59, 59, 999);

export const periodeSchema = z
  .object({
    fom: z
      .date({ message: "Fra-dato er påkrevd" })
      .refine((dato) => dato <= sluttenAvIDag, {
        message: "Fra-dato kan ikke være i fremtiden",
      }),
    tom: z
      .date({ message: "Til-dato er påkrevd" })
      .refine((dato) => dato <= sluttenAvIDag, {
        message: "Til-dato kan ikke være i fremtiden",
      }),
    simulertBeløp: beløpSchema,
    kravgrunnlagBeløp: beløpSchema,
  })
  .refine(
    (periode) => periode.tom && periode.fom && periode.tom >= periode.fom,
    {
      message: "Til-dato må være etter fra-dato",
      path: ["tom"],
    },
  );

export type Periode = z.infer<typeof periodeSchema>;
