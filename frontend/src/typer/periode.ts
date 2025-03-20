import { z } from "zod";

const sluttenAvIDag = new Date();
sluttenAvIDag.setHours(23, 59, 59, 999);

export const periodeSchema = z.object({
  fom: z
    .date({ required_error: "Fra dato er påkrevd" })
    .refine((date) => date <= sluttenAvIDag, {
      message: "Fra-dato kan ikke være i fremtiden",
    }),
  tom: z
    .date({ required_error: "Til dato er påkrevd" })
    .refine((date) => date <= sluttenAvIDag, {
      message: "Til-dato kan ikke være i fremtiden",
    }),
});

export const komponentPeriodeSchema = z.object({
  fom: z.date().optional(),
  tom: z.date().optional(),
  id: z.string(),
});

export type Periode = z.infer<typeof periodeSchema>;
export type KomponentPeriode = z.infer<typeof komponentPeriodeSchema>;
