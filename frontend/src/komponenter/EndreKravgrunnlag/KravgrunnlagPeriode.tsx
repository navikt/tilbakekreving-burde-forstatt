import type { FC, JSX } from 'react';
import type { DatoAlternativ, EndreKravgrunnlagFormData } from '../../typer/endreKravgrunnlag';

import { TrashIcon } from '@navikt/aksel-icons';
import { Button, Heading, HStack, Select, TextField, VStack } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

interface Props {
    indeks: number;
    kanSlettes: boolean;
    onSlett: () => void;
    fraDatoAlternativer: DatoAlternativ[];
    tilDatoAlternativer: DatoAlternativ[];
}

export const KravgrunnlagPeriode: FC<Props> = ({
    indeks,
    kanSlettes,
    onSlett,
    fraDatoAlternativer,
    tilDatoAlternativer,
}: Props): JSX.Element => {
    const {
        register,
        formState: { errors },
    } = useFormContext<EndreKravgrunnlagFormData>();
    const periodeFeil = errors.perioder?.[indeks];

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
            <HStack gap="space-16" align="start">
                <Select
                    label="Dato fra"
                    size="small"
                    className="flex-1"
                    {...register(`perioder.${indeks}.datoFra`)}
                    error={periodeFeil?.datoFra?.message}
                >
                    <option value="">Velg dato</option>
                    {fraDatoAlternativer.map(alternativ => (
                        <option key={alternativ.value} value={alternativ.value}>
                            {alternativ.label}
                        </option>
                    ))}
                </Select>
                <Select
                    label="Dato til"
                    size="small"
                    className="flex-1"
                    {...register(`perioder.${indeks}.datoTil`)}
                    error={periodeFeil?.datoTil?.message}
                >
                    <option value="">Velg dato</option>
                    {tilDatoAlternativer.map(alternativ => (
                        <option key={alternativ.value} value={alternativ.value}>
                            {alternativ.label}
                        </option>
                    ))}
                </Select>
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
