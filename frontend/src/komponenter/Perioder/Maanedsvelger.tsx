import { HStack, MonthPicker, useMonthpicker } from "@navikt/ds-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { TilbakeFormData } from "../../typer/formData";

interface Props {
  indeks: number;
}

export const Maanedsvelger = ({ indeks }: Props) => {
  const {
    control,
    clearErrors,
    formState: { errors },
  } = useFormContext<TilbakeFormData>();
  const { fields, update } = useFieldArray({ control, name: "perioder" });

  const månedenFørInneværendeMåned = new Date();
  månedenFørInneværendeMåned.setMonth(
    månedenFørInneværendeMåned.getMonth() - 1
  );

  const { monthpickerProps: fromMonthpickerProps, inputProps: fromInputProps } =
    useMonthpicker({
      fromDate: new Date("2015-01-01"),
      toDate: månedenFørInneværendeMåned,
      onMonthChange: (month) => {
        if (month) update(indeks, { ...fields[indeks], fom: month });
        clearErrors(`perioder.${indeks}.fom`);
      },
    });

  const { monthpickerProps: toMonthpickerProps, inputProps: toInputProps } =
    useMonthpicker({
      fromDate: new Date("2015-01-01"),
      toDate: månedenFørInneværendeMåned,
      onMonthChange: (month) => {
        if (month) {
          const sisteDagIMåned = new Date(
            month.getFullYear(),
            month.getMonth() + 1,
            0
          );
          update(indeks, { ...fields[indeks], tom: sisteDagIMåned });
          clearErrors(`perioder.${indeks}.tom`);
        }
      },
    });

  return (
    <HStack gap="4">
      <MonthPicker {...fromMonthpickerProps} dropdownCaption>
        <Controller
          name={`perioder.${indeks}.fom`}
          control={control}
          render={() => (
            <MonthPicker.Input
              {...fromInputProps}
              label="Fra og med måned"
              error={errors.perioder?.[indeks]?.fom?.message}
            />
          )}
        />
      </MonthPicker>
      <MonthPicker {...toMonthpickerProps} dropdownCaption>
        <Controller
          name={`perioder.${indeks}.tom`}
          control={control}
          render={() => (
            <MonthPicker.Input
              {...toInputProps}
              label="Til og med måned"
              error={errors.perioder?.[indeks]?.tom?.message}
            />
          )}
        />
      </MonthPicker>
    </HStack>
  );
};
