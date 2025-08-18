import type { TilbakeFormData } from '../../typer/formData';

import { DatePicker, useDatepicker } from '@navikt/ds-react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
    indeks: number;
}

export const DagVelger = ({ indeks }: Props) => {
    const {
        control,
        clearErrors,
        setValue,
        formState: { errors },
    } = useFormContext<TilbakeFormData>();

    const { datepickerProps, inputProps } = useDatepicker({
        fromDate: new Date('2015-01-01'),
        toDate: new Date(),
        onDateChange: (dato: Date | undefined) => {
            if (dato) {
                setValue(`perioder.${indeks}.fom`, dato, {
                    shouldValidate: true,
                });
                setValue(`perioder.${indeks}.tom`, dato, {
                    shouldValidate: true,
                });
                clearErrors(`perioder.${indeks}.fom`);
                clearErrors(`perioder.${indeks}.tom`);
            }
        },
    });

    return (
        <DatePicker {...datepickerProps}>
            <Controller
                name={`perioder.${indeks}.fom`}
                control={control}
                render={() => (
                    <DatePicker.Input
                        {...inputProps}
                        label="Velg til og fra dato"
                        error={errors.perioder?.[indeks]?.fom?.message}
                    />
                )}
            />
        </DatePicker>
    );
};
