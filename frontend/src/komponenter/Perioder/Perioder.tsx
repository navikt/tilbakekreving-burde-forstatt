import type { FC, JSX } from 'react';
import type { TilbakeFormData } from '../../typer/formData';

import { PlusIcon, XMarkOctagonIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Button, HStack, TextField } from '@navikt/ds-react';
import { useCallback, useState } from 'react';
import {
    Controller,
    type ControllerRenderProps,
    useFieldArray,
    useFormContext,
} from 'react-hook-form';

import { datoYtelser, meldekortYtelser, månedsytelser } from '../../typer/ytelse';
import { DagVelger } from './Dagvelger';
import { FraTilDatoVelger } from './FraTilDatoVelger';
import { Maanedsvelger } from './Maanedsvelger';
import { MeldekortVelger } from './MeldekortVelger.tsx';

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
    onFjern?: () => void;
}

const Periode: FC<PeriodeInputProps> = ({ indeks, onFjern }: PeriodeInputProps) => {
    const {
        control,
        getValues,
        formState: { errors },
    } = useFormContext<TilbakeFormData>();
    const { ytelse } = getValues();
    return (
        <Box
            borderWidth="1"
            borderColor="neutral-subtle"
            padding="space-16"
            borderRadius="12"
            className="w-80 space-y-4"
        >
            <HStack justify="space-between" align="center">
                <BodyShort size="large" weight="semibold">
                    Periode {indeks + 1}
                </BodyShort>
                {onFjern && (
                    <Button
                        variant="tertiary"
                        size="small"
                        icon={<XMarkOctagonIcon aria-hidden />}
                        onClick={onFjern}
                        type="button"
                    >
                        Fjern
                    </Button>
                )}
            </HStack>
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
                render={({
                    field,
                }: {
                    field: ControllerRenderProps<
                        TilbakeFormData,
                        `perioder.${number}.simulertBeløp`
                    >;
                }): JSX.Element => (
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
                render={({
                    field,
                }: {
                    field: ControllerRenderProps<
                        TilbakeFormData,
                        `perioder.${number}.kravgrunnlagBeløp`
                    >;
                }): JSX.Element => (
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
        </Box>
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
            <HStack gap="space-16" paddingBlock="space-16">
                {fields.map((_, index) => (
                    <Periode
                        key={stableKeys[index]}
                        indeks={index}
                        onFjern={fields.length > 1 ? (): void => fjernPeriode(index) : undefined}
                    />
                ))}
                <Box
                    borderWidth="1"
                    borderColor="neutral-subtle"
                    borderRadius="12"
                    padding="space-16"
                    className="w-80 flex items-center justify-center border-dashed justify-self-stretch"
                >
                    <Button
                        variant="secondary"
                        size="small"
                        icon={<PlusIcon aria-hidden />}
                        onClick={leggTilPeriode}
                        type="button"
                    >
                        Legg til periode
                    </Button>
                </Box>
            </HStack>
        </section>
    );
};

export default Perioder;
