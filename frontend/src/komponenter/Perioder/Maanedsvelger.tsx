import { HStack, MonthPicker, useMonthpicker } from "@navikt/ds-react";
import { Controller, useFieldArray } from "react-hook-form";
import { PeriodeFeilmelding, TilbakekrevingControl } from "./Perioder";

interface Props {
  control: TilbakekrevingControl;
  indeks: number;
  feilmelding?: PeriodeFeilmelding;
}

export const Maanedsvelger = ({ control, indeks, feilmelding }: Props) => {
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
        }
      },
    });

  return (
    <HStack gap="4">
      <MonthPicker {...fromMonthpickerProps} dropdownCaption>
        <Controller
          name={`perioder.${indeks}.fom`}
          control={control}
          render={({ field }) => (
            <MonthPicker.Input
              {...fromInputProps}
              label="Fra og med måned"
              error={feilmelding?.[indeks]?.fom?.message}
              ref={field.ref}
              onBlur={field.onBlur}
              onChange={(value) => field.onChange(value)}
            />
          )}
        />
      </MonthPicker>
      <MonthPicker {...toMonthpickerProps} dropdownCaption>
        <Controller
          name={`perioder.${indeks}.tom`}
          control={control}
          render={({ field }) => (
            <MonthPicker.Input
              {...toInputProps}
              label="Til og med måned"
              error={feilmelding?.[indeks]?.tom?.message}
              ref={field.ref}
              onBlur={field.onBlur}
            />
          )}
        />
      </MonthPicker>
    </HStack>
  );
};
