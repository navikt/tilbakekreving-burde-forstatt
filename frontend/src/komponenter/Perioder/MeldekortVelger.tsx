import type { TilbakeFormData } from '../../typer/formData';

import { DatePicker, useDatepicker } from '@navikt/ds-react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
    indeks: number;
}

function leggTilDager(dato: Date, dager: number): Date {
    return new Date(dato.getFullYear(), dato.getMonth(), dato.getDate() + dager)
}

export const MeldekortVelger = ({ indeks }: Props) => {
    const {
        control,
        clearErrors,
        setValue,
        formState: { errors },
    } = useFormContext<TilbakeFormData>();

    const hentMandagsdato = (dato: Date) => {
        const dag = dato.getDay(); // 0 er søndag, 1 er mandag
        const diff = dato.getDate() - dag + (dag === 0 ? -6 : 1);

        return new Date(dato.setDate(diff));
    };

    const { datepickerProps, inputProps } = useDatepicker({
        fromDate: new Date('2015-01-01'),
        toDate: new Date(),
        onDateChange: (dato: Date | undefined) => {

            if (dato) {
                setValue(`perioder.${indeks}.fom`, hentMandagsdato(dato), {
                    shouldValidate: true,
                });
                setValue(`perioder.${indeks}.tom`, leggTilDager(dato, 11), {
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
