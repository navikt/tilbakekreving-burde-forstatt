import { Controller, useFieldArray } from "react-hook-form";
import { PeriodeFeilmelding, TilbakekrevingControl } from "./Perioder";
import { DatePicker, useRangeDatepicker } from "@navikt/ds-react/DatePicker";
import { HStack } from "@navikt/ds-react/Stack";

interface Props {
  control: TilbakekrevingControl;
  indeks: number;
  feilmelding?: PeriodeFeilmelding;
}

export const Dagvelger = ({ control, indeks, feilmelding }: Props) => {
  const { fields, update } = useFieldArray({ control, name: "perioder" });

  const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
    onRangeChange: (range) => {
      if (range?.from && range?.to)
        update(indeks, { ...fields[indeks], fom: range.from, tom: range.to });
    },
  });

  return (
    <DatePicker {...datepickerProps} dropdownCaption>
      <HStack gap="4">
        <Controller
          name={`perioder.${indeks}.fom`}
          control={control}
          render={({ field }) => (
            <DatePicker.Input
              {...fromInputProps}
              label="Fra dato"
              error={feilmelding?.[indeks]?.fom?.message}
              ref={field.ref}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          name={`perioder.${indeks}.tom`}
          control={control}
          render={({ field }) => (
            <DatePicker.Input
              {...toInputProps}
              label="Til dato"
              error={feilmelding?.[indeks]?.tom?.message}
              ref={field.ref}
              onBlur={field.onBlur}
            />
          )}
        />
      </HStack>
    </DatePicker>
  );
};
