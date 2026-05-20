import type { TilbakeFormData } from '../../typer/formData';
import type { FC } from 'react';

import { DatePicker, useDatepicker } from '@navikt/ds-react';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

interface Props {
    indeks: number;
}

export const DagVelger: FC<Props> = ({ indeks }) => {
    const {
        clearErrors,
        setValue,
        formState: { errors },
    } = useFormContext<TilbakeFormData>();

    const dagensDato = useMemo(() => {
        return new Date();
    }, []);

    const { datepickerProps, inputProps } = useDatepicker({
        fromDate: new Date('2015-01-01'),
        toDate: dagensDato,
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
        <DatePicker {...datepickerProps} dropdownCaption>
            <DatePicker.Input
                {...inputProps}
                label="Velg til og fra dato"
                size="small"
                error={errors.perioder?.[indeks]?.fom?.message}
            />
        </DatePicker>
    );
};
