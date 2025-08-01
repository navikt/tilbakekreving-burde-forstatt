import type { TilbakeFormData } from '../../typer/formData';

import { HStack, DatePicker, useRangeDatepicker } from '@navikt/ds-react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
    indeks: number;
}

export const FraTilDatoVelger = ({ indeks }: Props) => {
    const {
        control,
        clearErrors,
        setValue,
        formState: { errors },
    } = useFormContext<TilbakeFormData>();

    const månedenFørInneværendeMåned = new Date();
    månedenFørInneværendeMåned.setMonth(månedenFørInneværendeMåned.getMonth() - 1);

    const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
        fromDate: new Date('2015-01-01'),
        toDate: månedenFørInneværendeMåned,
        onRangeChange: range => {
            if (range?.from && range?.to) {
                setValue(`perioder.${indeks}.fom`, range.from, {
                    shouldValidate: true,
                });
                setValue(`perioder.${indeks}.tom`, range.to, {
                    shouldValidate: true,
                });
                clearErrors(`perioder.${indeks}.fom`);
                clearErrors(`perioder.${indeks}.tom`);
            }
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
                            label="Fra og til dato"
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
