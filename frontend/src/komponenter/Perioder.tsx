import { PlusIcon } from "@navikt/aksel-icons";

import { DatePicker, HStack, Button } from "@navikt/ds-react";

import { VStack } from "@navikt/ds-react";
import { Periode } from "../typer/periode";
import { TrashIcon } from "@navikt/aksel-icons";

interface Props {
  perioder: Periode[];
  setPerioder: (perioder: Periode[]) => void;
}

const Perioder = ({ perioder, setPerioder }: Props) => {
  const leggTilPeriode = () => {
    setPerioder([
      ...perioder,
      { fraDato: undefined, tilDato: undefined, id: crypto.randomUUID() },
    ]);
  };

  const fjernPeriode = (id: string) => {
    if (perioder.length > 1) {
      setPerioder(perioder.filter((periode) => periode.id !== id));
    }
  };

  const oppdaterPeriode = (
    id: string,
    felt: "fraDato" | "tilDato",
    verdi: Date | undefined
  ) => {
    setPerioder(
      perioder.map((periode) =>
        periode.id === id ? { ...periode, [felt]: verdi } : periode
      )
    );
  };
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Perioder</h2>
      <VStack gap="4">
        {perioder.map((periode) => (
          <HStack key={periode.id} gap="4" align="center">
            <DatePicker
              selected={periode.fraDato}
              onSelect={(date) => {
                console.log("Fra dato: ", date);
                oppdaterPeriode(periode.id, "fraDato", date);
              }}
              toDate={periode.tilDato}
              max={new Date(new Date().setHours(12, 0, 0, 0)).getTime()}
            >
              <DatePicker.Input label="Fra dato" />
            </DatePicker>

            <DatePicker
              selected={periode.tilDato}
              onSelect={(date) => oppdaterPeriode(periode.id, "tilDato", date)}
              fromDate={periode.fraDato || new Date("2020-01-01")}
            >
              <DatePicker.Input label="Til dato" />
            </DatePicker>

            {perioder.length > 1 && (
              <Button
                variant="tertiary"
                size="small"
                icon={<TrashIcon aria-hidden />}
                onClick={() => fjernPeriode(periode.id)}
                type="button"
                className="self-center"
              >
                Fjern
              </Button>
            )}
          </HStack>
        ))}
        <Button
          variant="secondary"
          size="small"
          icon={<PlusIcon aria-hidden />}
          onClick={leggTilPeriode}
          type="button"
          className="self-start"
        >
          Legg til periode
        </Button>
      </VStack>
    </div>
  );
};

export default Perioder;
