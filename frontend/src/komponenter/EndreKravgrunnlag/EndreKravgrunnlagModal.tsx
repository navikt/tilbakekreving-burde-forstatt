import type { JSX, RefObject } from 'react';
import type {
    EndreKravgrunnlagFormData,
    EndreKravgrunnlagPeriode,
} from '../../typer/endreKravgrunnlag';
import type { Ytelse as TYtelse } from '../../typer/ytelse.ts';

import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from '@navikt/aksel-icons';
import { Alert, Button, Loader, Modal, TextField, VStack } from '@navikt/ds-react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
    Controller,
    type ControllerRenderProps,
    FormProvider,
    type SubmitHandler,
    useFieldArray,
    useForm,
} from 'react-hook-form';

import { hentKravgrunnlagMutationKey } from '../../api/kravgrunnlag';
import { endreKravgrunnlagSchema } from '../../typer/endreKravgrunnlag';
import Ytelse from '../Ytelse.tsx';
import { KravgrunnlagPeriode } from './KravgrunnlagPeriode';

interface Props {
    ref: RefObject<HTMLDialogElement | null>;
}

const tomPeriode: EndreKravgrunnlagFormData['perioder'][number] = {
    datoFra: '',
    datoTil: '',
    feilutbetalt: '',
};

export const EndreKravgrunnlagModal = ({ ref }: Props): JSX.Element => {
    const metoder = useForm<EndreKravgrunnlagFormData>({
        resolver: zodResolver(endreKravgrunnlagSchema),
        defaultValues: {
            eksternFagsystemId: '',
            ytelse: '',
            perioder: [],
        },
        reValidateMode: 'onChange',
        mode: 'onSubmit',
    });

    const {
        control,
        handleSubmit,
        register,
        getValues,
        trigger,
        formState: { errors },
    } = metoder;

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'perioder',
    });

    const [stableKeys, setStableKeys] = useState<string[]>(() => []);
    const [nextId, setNextId] = useState(0);

    const hentKravgrunnlagMutation = useMutation<
        EndreKravgrunnlagPeriode[],
        Error,
        { ytelse: string; eksternFagsystemId: string }
    >({
        mutationKey: hentKravgrunnlagMutationKey,
        onSuccess: (perioder: EndreKravgrunnlagPeriode[]): void => {
            replace(perioder);
            setStableKeys(perioder.map((_, index) => `periode-${index}`));
            setNextId(perioder.length);
        },
    });

    const håndterHentKravgrunnlag = async (): Promise<void> => {
        const erGyldig = await trigger(['eksternFagsystemId', 'ytelse']);
        if (!erGyldig) {
            return;
        }

        const { eksternFagsystemId, ytelse } = getValues();
        hentKravgrunnlagMutation.mutate({ eksternFagsystemId, ytelse });
    };

    const leggTilPeriode = (): void => {
        setStableKeys(prev => [...prev, `periode-${nextId}`]);
        setNextId(n => n + 1);
        append(tomPeriode);
    };

    const fjernPeriode = (index: number): void => {
        setStableKeys(prev => prev.filter((_, i) => i !== index));
        remove(index);
    };

    const lukk = (): void => {
        ref.current?.close();
    };

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
                                    onClick={håndterHentKravgrunnlag}
                                    loading={hentKravgrunnlagMutation.isPending}
                                    className="shrink-0"
                                >
                                    Hent kravgrunnlag
                                </Button>
                            </div>

                            {hentKravgrunnlagMutation.isError && (
                                <Alert variant="error" size="small">
                                    {hentKravgrunnlagMutation.error.message}
                                </Alert>
                            )}

                            {hentKravgrunnlagMutation.isPending && (
                                <Loader size="large" title="Henter kravgrunnlag" />
                            )}

                            {fields.map((_, index) => (
                                <KravgrunnlagPeriode
                                    key={stableKeys[index]}
                                    indeks={index}
                                    kanSlettes={fields.length > 1}
                                    onSlett={(): void => fjernPeriode(index)}
                                />
                            ))}
                            {fields.length > 0 && (
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
                            )}
                            {fields.length > 0 && (
                                <Button size="small" type="submit" className="self-start">
                                    Endre kravgrunnlaget
                                </Button>
                            )}
                        </VStack>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="small" type="button" variant="secondary" onClick={lukk}>
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </form>
            </FormProvider>
        </Modal>
    );
};
