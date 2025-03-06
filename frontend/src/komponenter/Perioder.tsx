import { PlusIcon } from "@navikt/aksel-icons";
import {
  DatePicker,
  HStack,
  Button,
  useRangeDatepicker,
} from "@navikt/ds-react";
import { VStack } from "@navikt/ds-react";
import { Periode } from "../typer/periode";
import { TrashIcon } from "@navikt/aksel-icons";

interface Props {
  perioder: Periode[];
  setPerioder: (perioder: Periode[]) => void;
  isSubmitted?: boolean;
}

type DateRange = {
  from: Date;
  to: Date;
};

const PeriodeInput = ({
  periode,
  isSubmitted,
  onRangeChange,
}: {
  periode: Periode;
  isSubmitted: boolean;
  onRangeChange: (range: DateRange | undefined) => void;
}) => {
  const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
    fromDate: new Date("2020-01-01"),
    defaultSelected:
      periode.fraDato && periode.tilDato
        ? { from: periode.fraDato, to: periode.tilDato }
        : undefined,
    onRangeChange: (range) => {
      if (range?.from && range?.to) {
        onRangeChange({ from: range.from, to: range.to });
      } else {
        onRangeChange(undefined);
      }
    },
  });

  return (
    <DatePicker {...datepickerProps} dropdownCaption>
      <div className="flex gap-4">
        <DatePicker.Input
          {...fromInputProps}
          label="Fra dato*"
          error={
            isSubmitted && !periode.fraDato ? "Fra dato er påkrevd" : undefined
          }
        />
        <DatePicker.Input
          {...toInputProps}
          label="Til dato*"
          error={
            isSubmitted && !periode.tilDato ? "Til dato er påkrevd" : undefined
          }
        />
      </div>
    </DatePicker>
  );
};

const Perioder = ({ perioder, setPerioder, isSubmitted = false }: Props) => {
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

  const oppdaterPeriode = (id: string, range: DateRange | undefined) => {
    setPerioder(
      perioder.map((periode) =>
        periode.id === id
          ? { ...periode, fraDato: range?.from, tilDato: range?.to }
          : periode
      )
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Perioder</h2>
      <VStack gap="4">
        {perioder.map((periode) => (
          <HStack key={periode.id} gap="4" align="center">
            <PeriodeInput
              periode={periode}
              isSubmitted={isSubmitted}
              onRangeChange={(range) => oppdaterPeriode(periode.id, range)}
            />

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
