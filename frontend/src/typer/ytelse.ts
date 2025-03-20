import { z } from "zod";

export const ytelseSchema = z.enum(
  ["Overgangsstønad", "Barnetrygd", "Kontantstøtte"],
  { message: "Ugyldig ytelse" }
);
export type Ytelse = z.infer<typeof ytelseSchema>;

export const ytelseGrupper = [
  {
    fagsystem: "Enslig forsørger",
    ytelser: [ytelseSchema.enum.Overgangsstønad],
  },
  {
    fagsystem: "Barnetrygd og kontantstøtte",
    ytelser: [ytelseSchema.enum.Barnetrygd, ytelseSchema.enum.Kontantstøtte],
  },
] as const;
