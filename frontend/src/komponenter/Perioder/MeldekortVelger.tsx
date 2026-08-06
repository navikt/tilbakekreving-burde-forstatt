import type { TilbakeFormData } from '../../typer/formData';

import { DatePicker, useDatepicker, VStack } from '@navikt/ds-react';
import { format } from 'date-fns';
import { type FC, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

interface Props {
    indeks: number;
}

function leggTilDager(dato: Date, dager: number): Date {
    return new Date(dato.getFullYear(), dato.getMonth(), dato.getDate() + dager);
}

const ALLE_DAGER_UNNTATT_MANDAG = [0, 2, 3, 4, 5, 6];
const DAGER_I_MELDEKORTPERIODE = 13;

export const MeldekortVelger: FC<Props> = ({ indeks }: Props) => {
    const {
        clearErrors,
        control,
        setValue,
        formState: { errors },
    } = useFormContext<TilbakeFormData>();

    const tom = useWatch({ control, name: `perioder.${indeks}.tom` });

    const sisteGyldigeStartdato = useMemo(
        () => leggTilDager(new Date(), -DAGER_I_MELDEKORTPERIODE),
        []
    );

    const { datepickerProps, inputProps } = useDatepicker({
        fromDate: new Date('2015-01-01'),
        toDate: sisteGyldigeStartdato,
        disabled: [{ dayOfWeek: ALLE_DAGER_UNNTATT_MANDAG }],
        onDateChange: (dato: Date | undefined) => {
            if (dato) {
                setValue(`perioder.${indeks}.fom`, dato, {
                    shouldValidate: true,
                });
                setValue(`perioder.${indeks}.tom`, leggTilDager(dato, DAGER_I_MELDEKORTPERIODE), {
                    shouldValidate: true,
                });
                clearErrors(`perioder.${indeks}.fom`);
                clearErrors(`perioder.${indeks}.tom`);
            }
        },
    });

    return (
        <DatePicker {...datepickerProps}>
            <VStack gap="space-16">
                <DatePicker.Input
                    {...inputProps}
                    size="small"
                    label="Startdato for meldekortperioden"
                    className="[&_.aksel-date\_\_field-wrapper]:w-45 [&_input]:grow [&_input]:min-w-0"
                    error={errors.perioder?.[indeks]?.fom?.message}
                />
                <DatePicker.Input
                    size="small"
                    label="Sluttdato for meldekortperioden"
                    readOnly
                    value={tom ? format(tom, 'dd.MM.yyyy') : ''}
                    className="[&_.aksel-date\_\_field-wrapper]:w-45 [&_input]:grow [&_input]:min-w-0"
                    error={errors.perioder?.[indeks]?.tom?.message}
                />
            </VStack>
        </DatePicker>
    );
};
