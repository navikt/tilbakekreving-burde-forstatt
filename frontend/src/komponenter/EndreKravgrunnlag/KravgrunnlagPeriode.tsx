import type { FC, JSX } from 'react';
import type { EndreKravgrunnlagFormData } from '../../typer/endreKravgrunnlag';

import { TrashIcon } from '@navikt/aksel-icons';
import {
    Button,
    DatePicker,
    Heading,
    HStack,
    TextField,
    useRangeDatepicker,
    VStack,
} from '@navikt/ds-react';
import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

type DateRange = {
    from: Date | undefined;
    to?: Date | undefined;
};

interface Props {
    indeks: number;
    kanSlettes: boolean;
    onSlett: () => void;
}

export const KravgrunnlagPeriode: FC<Props> = ({
    indeks,
    kanSlettes,
    onSlett,
}: Props): JSX.Element => {
    const {
        register,
        getValues,
        setValue,
        clearErrors,
        formState: { errors },
    } = useFormContext<EndreKravgrunnlagFormData>();
    const periodeFeil = errors.perioder?.[indeks];

    const initialtValgt = useMemo((): DateRange => {
        const periode = getValues(`perioder.${indeks}`);
        return {
            from: periode?.datoFra ? parseISO(periode.datoFra) : undefined,
            to: periode?.datoTil ? parseISO(periode.datoTil) : undefined,
        };
    }, [getValues, indeks]);

    const { datepickerProps, fromInputProps, toInputProps } = useRangeDatepicker({
        defaultSelected: initialtValgt,
        onRangeChange: (range: DateRange | undefined): void => {
            setValue(
                `perioder.${indeks}.datoFra`,
                range?.from ? format(range.from, 'yyyy-MM-dd') : '',
                { shouldValidate: true }
            );
            setValue(
                `perioder.${indeks}.datoTil`,
                range?.to ? format(range.to, 'yyyy-MM-dd') : '',
                { shouldValidate: true }
            );
            if (range?.from) {
                clearErrors(`perioder.${indeks}.datoFra`);
            }
            if (range?.to) {
                clearErrors(`perioder.${indeks}.datoTil`);
            }
        },
    });

    return (
        <VStack gap="space-8">
            <HStack justify="space-between" align="center">
                <Heading size="xsmall" level="2">
                    Periode {indeks + 1}
                </Heading>
                {kanSlettes && (
                    <Button
                        type="button"
                        variant="tertiary"
                        size="small"
                        icon={<TrashIcon title={`Slett periode ${indeks + 1}`} />}
                        onClick={onSlett}
                    >
                        Slett
                    </Button>
                )}
            </HStack>
            <HStack gap="space-16" align="end">
                <DatePicker {...datepickerProps} dropdownCaption>
                    <HStack gap="space-16">
                        <DatePicker.Input
                            {...fromInputProps}
                            label="Dato fra"
                            size="small"
                            error={periodeFeil?.datoFra?.message}
                        />
                        <DatePicker.Input
                            {...toInputProps}
                            label="Dato til"
                            size="small"
                            error={periodeFeil?.datoTil?.message}
                        />
                    </HStack>
                </DatePicker>
                <TextField
                    label="Feilutbetalt"
                    size="small"
                    className="flex-1"
                    inputMode="text"
                    {...register(`perioder.${indeks}.feilutbetalt`)}
                    error={periodeFeil?.feilutbetalt?.message}
                />
            </HStack>
        </VStack>
    );
};
