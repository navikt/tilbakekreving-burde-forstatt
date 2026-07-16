import type { JSX, RefObject } from 'react';
import type { DatoAlternativ, EndreKravgrunnlagFormData } from '../../typer/endreKravgrunnlag';

import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from '@navikt/aksel-icons';
import { Button, Modal, TextField, VStack } from '@navikt/ds-react';
import { useCallback, useState } from 'react';
import { FormProvider, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';

import { endreKravgrunnlagSchema } from '../../typer/endreKravgrunnlag';
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
        formState: { errors },
    } = metoder;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'perioder',
    });

    const [stableKeys, setStableKeys] = useState(() => ['periode-0']);
    const [nextId, setNextId] = useState(1);

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
        <Modal ref={ref} header={{ heading: 'Endre kravgrunnlaget' }} width="556px">
            <FormProvider {...metoder}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <VStack gap="space-24">
                            <TextField
                                label="Ekstern fagsystem id"
                                size="small"
                                className="w-[calc((100%-2rem)/3)]"
                                {...register('eksternFagsystemId')}
                                error={errors.eksternFagsystemId?.message}
                            />
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
