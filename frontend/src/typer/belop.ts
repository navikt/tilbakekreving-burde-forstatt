import { z } from "zod";

const erGyldigBeløpFormat = (verdi: string): boolean => {
  return /^[0-9]+([.,][0-9]+)?$/.test(verdi);
};

const konverterTilNummer = (verdi: string): number => {
  const formattertVerdi = verdi.replace(",", ".");
  return Number(formattertVerdi);
};

const erPositivtTall = (verdi: string): boolean => {
  const trimmetVerdi = verdi.trim();
  if (!erGyldigBeløpFormat(trimmetVerdi)) {
    return false;
  }

  const nummerVerdi = konverterTilNummer(trimmetVerdi);
  return !isNaN(nummerVerdi) && nummerVerdi > 0;
};

export const beløpSchema = z
  .string({ required_error: "Beløp må fylles ut" })
  .min(1, { message: "Beløp må fylles ut" })
  .refine(erPositivtTall, {
    message: "Beløp må være et positivt tall",
  });

export type Beløp = z.infer<typeof beløpSchema>;
