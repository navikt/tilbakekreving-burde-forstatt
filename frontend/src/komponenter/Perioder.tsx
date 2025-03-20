import { PlusIcon } from "@navikt/aksel-icons";
import {
  DatePicker,
  HStack,
  Button,
  useRangeDatepicker,
} from "@navikt/ds-react";
import { VStack } from "@navikt/ds-react";
import { TrashIcon } from "@navikt/aksel-icons";
import { KomponentPeriode } from "../typer/periode";
import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

type PeriodeFeilmelding =
  | Merge<
      FieldError,
      (
        | Merge<
            FieldError,
            FieldErrorsImpl<{
              fom: Date;
              tom: Date;
            }>
          >
        | undefined
      )[]
    >
  | undefined;

interface Props {
  perioder: KomponentPeriode[];
  setPerioder: (perioder: KomponentPeriode[]) => void;
  feilMelding?: PeriodeFeilmelding;
}

type DateRange = {
  fom: Date;
  tom: Date;
};

interface PeriodeInputProps {
  periode: KomponentPeriode;
  indeks: number;
  onRangeChange: (range: DateRange | undefined) => void;
  feilMelding?: PeriodeFeilmelding;
}

const PeriodeInput = ({
  periode,
  onRangeChange,
  indeks,
  feilMelding,
}: PeriodeInputProps) => {
  const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
    fromDate: new Date("2020-01-01"),
    defaultSelected:
      periode.fom && periode.tom
        ? { from: periode.fom, to: periode.tom }
        : undefined,
    onRangeChange: (range) => {
      if (range?.from && range?.to) {
        onRangeChange({ fom: range.from, tom: range.to });
      } else {
        onRangeChange(undefined);
      }
    },
  });

  const fomFeilMelding =
    feilMelding && feilMelding[indeks] && feilMelding[indeks].fom?.message;

  const tomFeilMelding =
    feilMelding && feilMelding[indeks] && feilMelding[indeks].tom?.message;
  return (
    <DatePicker {...datepickerProps} dropdownCaption>
      <div className="flex gap-4">
        <DatePicker.Input
          {...fromInputProps}
          label="Fra dato"
          error={fomFeilMelding}
        />
        <DatePicker.Input
          {...toInputProps}
          label="Til dato"
          error={tomFeilMelding}
        />
      </div>
    </DatePicker>
  );
};

const Perioder = ({ perioder, setPerioder, feilMelding }: Props) => {
  const leggTilPeriode = () => {
    setPerioder([
      ...perioder,
      { fom: undefined, tom: undefined, id: crypto.randomUUID() },
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
          ? { ...periode, fom: range?.fom, tom: range?.tom }
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
              indeks={perioder.indexOf(periode)}
              onRangeChange={(range) => oppdaterPeriode(periode.id, range)}
              feilMelding={feilMelding}
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
