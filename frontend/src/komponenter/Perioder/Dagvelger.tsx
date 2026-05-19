import type { TilbakeFormData } from '../../typer/formData';
import type { FC } from 'react';

import { DatePicker, useDatepicker } from '@navikt/ds-react';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
    indeks: number;
}

export const DagVelger: FC<Props> = ({ indeks }) => {
    const {
        control,
        setValue,
        formState: { errors },
    } = useFormContext<TilbakeFormData>();

    const dagensDato = useMemo(() => {
        return new Date();
    }, []);

    const { datepickerProps, inputProps } = useDatepicker({
        fromDate: new Date('2015-01-01'),
        toDate: dagensDato,
        onDateChange: async (dato: Date | undefined) => {
            if (dato) {
                setValue(`perioder.${indeks}.fom`, dato, {
                    shouldDirty: true,
                });
                setValue(`perioder.${indeks}.tom`, dato, {
                    shouldDirty: true,
                });
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
                        size="small"
                        label="Velg til og fra dato"
                        error={errors.perioder?.[indeks]?.fom?.message}
                    />
                )}
            />
        </DatePicker>
    );
};
