import type { TilbakeFormData } from '../../typer/formData';

import { HStack, MonthPicker, useMonthpicker } from '@navikt/ds-react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
    indeks: number;
}

export const Maanedsvelger = ({ indeks }: Props) => {
    const {
        control,
        clearErrors,
        setValue,
        formState: { errors },
    } = useFormContext<TilbakeFormData>();

    const månedenFørInneværendeMåned = new Date();
    månedenFørInneværendeMåned.setMonth(månedenFørInneværendeMåned.getMonth() - 1);

    const { monthpickerProps: fromMonthpickerProps, inputProps: fromInputProps } = useMonthpicker({
        fromDate: new Date('2015-01-01'),
        toDate: månedenFørInneværendeMåned,
        onMonthChange: førsteDagIMåneden => {
            if (førsteDagIMåneden) {
                setValue(`perioder.${indeks}.fom`, førsteDagIMåneden, {
                    shouldValidate: true,
                });
                clearErrors(`perioder.${indeks}.fom`);
            }
        },
    });

    const { monthpickerProps: toMonthpickerProps, inputProps: toInputProps } = useMonthpicker({
        fromDate: new Date('2015-01-01'),
        toDate: månedenFørInneværendeMåned,
        onMonthChange: førsteDagIMåneden => {
            if (førsteDagIMåneden) {
                const sisteDagIMåned = new Date(
                    førsteDagIMåneden.getFullYear(),
                    førsteDagIMåneden.getMonth() + 1,
                    0
                );
                setValue(`perioder.${indeks}.tom`, sisteDagIMåned, {
                    shouldValidate: true,
                });
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
