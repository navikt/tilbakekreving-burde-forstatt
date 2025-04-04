import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { DatePicker, useRangeDatepicker } from "@navikt/ds-react/DatePicker";
import { HStack } from "@navikt/ds-react/Stack";
import { TilbakeFormData } from "../../typer/formData";

interface Props {
  indeks: number;
}

export const Dagvelger = ({ indeks }: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<TilbakeFormData>();
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
          render={() => (
            <DatePicker.Input
              {...fromInputProps}
              label="Fra dato"
              error={errors.perioder?.[indeks]?.fom?.message}
            />
          )}
        />
        <Controller
          name={`perioder.${indeks}.tom`}
          control={control}
          render={() => (
            <DatePicker.Input
              {...toInputProps}
              label="Til dato"
              error={errors.perioder?.[indeks]?.tom?.message}
            />
          )}
        />
      </HStack>
    </DatePicker>
  );
};
