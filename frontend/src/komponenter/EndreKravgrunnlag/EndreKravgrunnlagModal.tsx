import type { JSX, RefObject } from 'react';
import type { DatoAlternativ, EndreKravgrunnlagFormData } from '../../typer/endreKravgrunnlag';
import type { Ytelse as TYtelse } from '../../typer/ytelse.ts';

import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from '@navikt/aksel-icons';
import { Button, Modal, TextField, VStack } from '@navikt/ds-react';
import { useCallback, useState } from 'react';
import {
    Controller,
    type ControllerRenderProps,
    FormProvider,
    type SubmitHandler,
    useFieldArray,
    useForm,
} from 'react-hook-form';

import { endreKravgrunnlagSchema } from '../../typer/endreKravgrunnlag';
import Ytelse from '../Ytelse.tsx';
import { KravgrunnlagPeriode } from './KravgrunnlagPeriode';

interface Props {
    ref: RefObject<HTMLDialogElement | null>;
    fraDatoAlternativer: DatoAlternativ[];
    tilDatoAlternativer: DatoAlternativ[];
}

const tomPeriode: EndreKravgrunnlagFormData['perioder'][number] = {
    datoFra: '',
    datoTil: '',
    feilutbetalt: '',
};

export const EndreKravgrunnlagModal = ({
    ref,
    fraDatoAlternativer,
    tilDatoAlternativer,
}: Props): JSX.Element => {
    const metoder = useForm<EndreKravgrunnlagFormData>({
        resolver: zodResolver(endreKravgrunnlagSchema),
        defaultValues: {
            eksternFagsystemId: '',
            perioder: [tomPeriode],
        },
        reValidateMode: 'onChange',
        mode: 'onSubmit',
    });

    const {
        control,
        handleSubmit,
        register,
        getValues,
        formState: { errors },
    } = metoder;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'perioder',
    });

    const [stableKeys, setStableKeys] = useState(() => ['periode-0']);
    const [nextId, setNextId] = useState(1);

    const hentKravgrunnlag = useCallback(async (): Promise<void> => {
        const { eksternFagsystemId, ytelse } = getValues();

        if (!eksternFagsystemId?.trim() || !ytelse?.trim()) {
            console.error('Mangler eksternFagsystemId eller ytelse');
            return;
        }

        const encodedYtelse = encodeURIComponent(ytelse.trim());
        const encodedEksternFagsystemId = encodeURIComponent(eksternFagsystemId.trim());

        const response = await fetch(
            `/api/kravgrunnlag/${encodedYtelse}/${encodedEksternFagsystemId}`,
            {
                method: 'GET',
                headers: { Accept: 'application/json' },
                credentials: 'include',
            }
        );

        if (!response.ok) {
            console.error(`Klarte ikke hente kravgrunnlag: ${response.status}`);
            return;
        }

        const data = await response.json();
        console.log('Kravgrunnlag:', data);
    }, [getValues]);

    const leggTilPeriode = useCallback((): void => {
        setStableKeys(prev => [...prev, `periode-${nextId}`]);
        setNextId(n => n + 1);
        append(tomPeriode);
    }, [append, nextId]);

    const fjernPeriode = useCallback(
        (index: number): void => {
            setStableKeys(prev => prev.filter((_, i) => i !== index));
            remove(index);
        },
        [remove]
    );

    const lukk = useCallback((): void => {
        ref.current?.close();
    }, [ref]);

    const onSubmit: SubmitHandler<EndreKravgrunnlagFormData> = (): void => {
        lukk();
    };

    return (
        <Modal ref={ref} header={{ heading: 'Endre kravgrunnlaget' }} width="700px">
            <FormProvider {...metoder}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <VStack gap="space-24">
                            <div className="flex items-end gap-4">
                                <TextField
                                    label="Ekstern fagsystem id"
                                    size="small"
                                    className="flex-1"
                                    {...register('eksternFagsystemId')}
                                    error={errors.eksternFagsystemId?.message}
                                />
                                <Controller
                                    name="ytelse"
                                    control={control}
                                    render={({
                                        field,
                                    }: {
                                        field: ControllerRenderProps<
                                            EndreKravgrunnlagFormData,
                                            'ytelse'
                                        >;
                                    }): JSX.Element => (
                                        <Ytelse
                                            setValgtYtelse={(nyYtelse: TYtelse | undefined): void =>
                                                field.onChange(nyYtelse ?? '')
                                            }
                                        />
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="small"
                                    icon={<PlusIcon aria-hidden />}
                                    onClick={hentKravgrunnlag}
                                    className="shrink-0"
                                >
                                    Hent Kravgrunnlag
                                </Button>
                            </div>

                            {fields.map((_, index) => (
                                <KravgrunnlagPeriode
                                    key={stableKeys[index]}
                                    indeks={index}
                                    kanSlettes={fields.length > 1}
                                    onSlett={(): void => fjernPeriode(index)}
                                    fraDatoAlternativer={fraDatoAlternativer}
                                    tilDatoAlternativer={tilDatoAlternativer}
                                />
                            ))}
                            <Button
                                type="button"
                                variant="secondary"
                                size="small"
                                icon={<PlusIcon aria-hidden />}
                                onClick={leggTilPeriode}
                                className="self-start"
                            >
                                Legg til ny periode
                            </Button>
                        </VStack>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="small" type="submit">
                            Endre kravgrunnlaget
                        </Button>
                        <Button size="small" type="button" variant="secondary" onClick={lukk}>
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </form>
            </FormProvider>
        </Modal>
    );
};
