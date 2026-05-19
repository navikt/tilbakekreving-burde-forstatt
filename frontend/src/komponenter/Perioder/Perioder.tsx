import type { TilbakeFormData } from '../../typer/formData';
import type { FC } from 'react';

import { PlusIcon } from '@navikt/aksel-icons';
import { TrashIcon } from '@navikt/aksel-icons';
import { HStack, Button, TextField } from '@navikt/ds-react';
import { VStack } from '@navikt/ds-react';
import { useCallback, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { DagVelger } from './Dagvelger';
import { FraTilDatoVelger } from './FraTilDatoVelger';
import { Maanedsvelger } from './Maanedsvelger';
import { MeldekortVelger } from './MeldekortVelger.tsx';
import { månedsytelser, datoYtelser, meldekortYtelser } from '../../typer/ytelse';

const erMånedsytelse = (ytelse: string): boolean => {
    return månedsytelser.some(månedsYtelse => månedsYtelse === ytelse);
};

const erMeldekortsytelse = (ytelse: string): boolean => {
    return meldekortYtelser.some(meldekortYtelse => meldekortYtelse === ytelse);
};

const erDatoYtelse = (ytelse: string): boolean => {
    return datoYtelser.some(datoYtelse => datoYtelse === ytelse);
};

interface PeriodeInputProps {
    indeks: number;
}

const Periode: FC<PeriodeInputProps> = ({ indeks }: PeriodeInputProps) => {
    const {
        control,
        getValues,
        formState: { errors },
    } = useFormContext<TilbakeFormData>();
    const { ytelse } = getValues();
    return (
        <VStack className="border-4 p-5 border-purple-500 rounded-lg" gap="space-16">
            <h3 className="font-bold text-blue-700">Periode {indeks + 1}</h3>
            {erMånedsytelse(ytelse) ? (
                <Maanedsvelger indeks={indeks} />
            ) : erDatoYtelse(ytelse) ? (
                <DagVelger indeks={indeks} />
            ) : erMeldekortsytelse(ytelse) ? (
                <MeldekortVelger indeks={indeks} />
            ) : (
                <FraTilDatoVelger indeks={indeks} />
            )}

            <Controller
                name={`perioder.${indeks}.simulertBeløp`}
                control={control}
                render={({ field }) => (
                    <TextField
                        label="Simulert feilutbetalt månedsbeløp"
                        {...field}
                        type="text"
                        size="small"
                        inputMode="text"
                        error={errors.perioder?.[indeks]?.simulertBeløp?.message}
                    />
                )}
            />
            <Controller
                name={`perioder.${indeks}.kravgrunnlagBeløp`}
                control={control}
                render={({ field }) => (
                    <TextField
                        label="Kravgrunnlag månedsbeløp"
                        {...field}
                        type="text"
                        size="small"
                        inputMode="text"
                        error={errors.perioder?.[indeks]?.kravgrunnlagBeløp?.message}
                    />
                )}
            />
        </VStack>
    );
};

const Perioder: FC = () => {
    const { control } = useFormContext<TilbakeFormData>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'perioder',
    });

    // useFieldArray kan regenerere fields med nye id-verdier etter setValue,
    // som fører til unmount/remount. Vi holder egne stabile keys.
    const [stableKeys, setStableKeys] = useState(() => ['periode-0']);
    const [nextId, setNextId] = useState(1);

    const leggTilPeriode = useCallback((): void => {
        // append bruker ikke Partial på typen. Blir uansett hacky med enten superRefine på zod-valideringen eller casting her...
        // Subscriber på denne for å lytte etter fiks: https://github.com/orgs/react-hook-form/discussions/10211
        setStableKeys(prev => [...prev, `periode-${nextId}`]);
        setNextId(n => n + 1);
        append({
            fom: undefined as unknown as Date,
            tom: undefined as unknown as Date,
            simulertBeløp: '',
            kravgrunnlagBeløp: '',
        });
    }, [append, nextId]);

    const fjernPeriode = useCallback(
        (index: number): void => {
            setStableKeys(prev => prev.filter((_, i) => i !== index));
            remove(index);
        },
        [remove]
    );

    return (
        <section>
            <h2 className="text-xl font-semibold mb-4">Perioder</h2>
            <VStack gap="space-16">
                {fields.map((_, index) => (
                    <HStack key={stableKeys[index]} gap="space-16" align="center">
                        <Periode indeks={index} />

                        {fields.length > 1 && (
                            <Button
                                variant="tertiary"
                                size="small"
                                icon={<TrashIcon aria-hidden />}
                                onClick={() => fjernPeriode(index)}
                                type="button"
                                className="self-center"
                            >
                                Fjern
                            </Button>
                        )}
                    </HStack>
                ))}
                <Button
                    variant="secondary"
                    size="small"
                    icon={<PlusIcon aria-hidden />}
                    onClick={leggTilPeriode}
                    type="button"
                    className="self-start"
                >
                    Legg til periode
                </Button>
            </VStack>
        </section>
    );
};

export default Perioder;
