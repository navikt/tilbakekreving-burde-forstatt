import type { FC } from 'react';
import type { TilbakeFormData } from '../../typer/formData';

import { HStack, MonthPicker, useMonthpicker } from '@navikt/ds-react';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

interface Props {
    indeks: number;
}

export const Maanedsvelger: FC<Props> = ({ indeks }: Props) => {
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

    const { monthpickerProps: fromMonthpickerProps, inputProps: fromInputProps } = useMonthpicker({
        fromDate: new Date('2015-01-01'),
        toDate: månedenFørInneværendeMåned,
        onMonthChange: (førsteDagIMåneden: Date | undefined): void => {
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
        onMonthChange: (førsteDagIMåneden: Date | undefined): void => {
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
        <HStack align="center" gap="space-12">
            <MonthPicker {...fromMonthpickerProps} dropdownCaption>
                <MonthPicker.Input
                    {...fromInputProps}
                    label="Fra og med måned"
                    size="small"
                    className="[&_.aksel-date\_\_field-wrapper]:w-34 [&_input]:min-w-0"
                    error={errors.perioder?.[indeks]?.fom?.message}
                />
            </MonthPicker>
            <MonthPicker {...toMonthpickerProps} dropdownCaption>
                <MonthPicker.Input
                    {...toInputProps}
                    label="Til og med måned"
                    size="small"
                    className="[&_.aksel-date\_\_field-wrapper]:w-34 [&_input]:min-w-0"
                    error={errors.perioder?.[indeks]?.tom?.message}
                />
            </MonthPicker>
        </HStack>
    );
};
