import type { FC } from 'react';
import type { TilbakeFormData } from '../../typer/formData';

import { DatePicker, HStack, useRangeDatepicker } from '@navikt/ds-react';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

interface Props {
    indeks: number;
}

export const FraTilDatoVelger: FC<Props> = ({ indeks }) => {
    const {
        clearErrors,
        setValue,
        formState: { errors },
    } = useFormContext<TilbakeFormData>();

    const månedenFørInneværendeMåned = useMemo(() => {
        const dato = new Date();
        dato.setMonth(dato.getMonth() - 1);
        return dato;
    }, []);

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
            <HStack gap="space-16">
                <DatePicker.Input
                    {...fromInputProps}
                    label="Fra og til dato"
                    size="small"
                    error={errors.perioder?.[indeks]?.fom?.message}
                />
                <DatePicker.Input
                    {...toInputProps}
                    label="Til dato"
                    size="small"
                    error={errors.perioder?.[indeks]?.tom?.message}
                />
            </HStack>
        </DatePicker>
    );
};
