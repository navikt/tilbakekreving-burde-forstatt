import type { FC, JSX } from 'react';
import type { TilbakeFormData, TilbakeRequest } from './typer/formData';
import type { Ytelse as TYtelse } from './typer/ytelse';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightIcon, ReceiptIcon } from '@navikt/aksel-icons';
import { Box, Checkbox, Heading, InlineMessage } from '@navikt/ds-react';
import { Button } from '@navikt/ds-react/Button';
import { HStack, VStack } from '@navikt/ds-react/Stack';
import { TextField } from '@navikt/ds-react/TextField';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useRef } from 'react';
import {
    Controller,
    type ControllerRenderProps,
    FormProvider,
    useForm,
    useWatch,
} from 'react-hook-form';

import { EndreKravgrunnlagModal } from './komponenter/EndreKravgrunnlag/EndreKravgrunnlagModal';
import { Header } from './komponenter/Header';
import Perioder from './komponenter/Perioder/Perioder';
import Ytelse from './komponenter/Ytelse';
import { tilbakeFormDataSchema } from './typer/formData';

type TilbakekrevingResponse = {
    data: string;
    frontendFeilmelding: string;
    melding: string;
    stacktrace: string;
    status: string;
};

const formatterTilYYYYMMDD = (date: Date): string => format(date, 'yyyy-MM-dd');

const postTilbakekreving = async (data: TilbakeRequest): Promise<TilbakekrevingResponse> => {
    const response = await fetch('/api/tilbakekreving', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Noe gikk galt ved opprettelse av tilbakekreving');
    }

    const responseData: TilbakekrevingResponse = await response.json();

    if (responseData.frontendFeilmelding) {
        throw new Error(responseData.frontendFeilmelding);
    }

    return responseData;
};

const App: FC = () => {
    const svarMeldingRef = useRef<HTMLDivElement>(null);
    const endreKravgrunnlagModalRef = useRef<HTMLDialogElement>(null);

    const metoder = useForm<TilbakeFormData>({
        resolver: zodResolver(tilbakeFormDataSchema),
        defaultValues: {
            perioder: [
                {
                    fom: undefined,
                    tom: undefined,
                    simulertBeløp: '',
                    kravgrunnlagBeløp: '',
                },
            ],
            sendKravgrunnlag: true,
            ytelse: undefined,
            personIdent: '',
        },
        reValidateMode: 'onChange',
        mode: 'onSubmit',
    });
    const {
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = metoder;

    const watchedYtelse = useWatch({ control: metoder.control, name: 'ytelse' });

    const mutation = useMutation({
        mutationFn: (formData: TilbakeFormData) => {
            const requestObject = {
                ...formData,
                perioder: formData.perioder.map(periode => {
                    if (!periode.fom || !periode.tom) {
                        throw new Error('Periode må ha både fra-dato og til-dato');
                    }
                    const periodeUtenId = {
                        fom: periode.fom,
                        tom: periode.tom,
                        simulertBelop: Number(periode.simulertBeløp),
                        kravgrunnlagBelop: Number(periode.kravgrunnlagBeløp),
                    };
                    return {
                        ...periodeUtenId,
                        fom: formatterTilYYYYMMDD(periode.fom),
                        tom: formatterTilYYYYMMDD(periode.tom),
                    };
                }),
            };
            return postTilbakekreving(requestObject);
        },
        onMutate: () => {
            setTimeout(() => {
                if (svarMeldingRef.current) {
                    svarMeldingRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }
            }, 200);
        },
    });

    const resetSkjema = (): void => {
        reset();
        mutation.reset();
    };

    return (
        <div className="flex min-h-dvh flex-col">
            <Header />
            <VStack padding="space-16" className="w-full grow bg-ax-bg-neutral-soft">
                <VStack
                    gap="space-16"
                    padding="space-24"
                    className="w-full grow rounded-xl border border-ax-border-neutral-subtle bg-ax-bg-default"
                >
                    <HStack justify="space-between" align="end">
                        <VStack gap="space-8">
                            <Heading size="medium">Burde forstått 🤔</Heading>
                            <InlineMessage status="info">
                                Dette er en testapplikasjon for oppretting av tilbakekrevingssaker
                            </InlineMessage>
                        </VStack>
                        <Button
                            data-color="neutral"
                            type="button"
                            variant="secondary"
                            icon={<ReceiptIcon aria-hidden />}
                            onClick={(): void => endreKravgrunnlagModalRef.current?.showModal()}
                        >
                            Rediger kravgrunnlag
                        </Button>
                    </HStack>

                    <FormProvider {...metoder}>
                        <Box
                            borderWidth="1"
                            borderColor="neutral-subtle"
                            borderRadius="12"
                            padding="space-16"
                            className="flex grow flex-col"
                        >
                            <form
                                onSubmit={handleSubmit(data => mutation.mutate(data))}
                                className="flex grow flex-col"
                            >
                                <Heading size="small" spacing>
                                    Opprett testdata
                                </Heading>
                                <VStack justify="space-between" gap="space-16" className="grow">
                                    <VStack>
                                        <HStack gap="space-16" align="end">
                                            <Controller
                                                name="ytelse"
                                                control={metoder.control}
                                                render={({
                                                    field,
                                                }: {
                                                    field: ControllerRenderProps<
                                                        TilbakeFormData,
                                                        'ytelse'
                                                    >;
                                                }): JSX.Element => (
                                                    <Ytelse
                                                        className="w-80"
                                                        setValgtYtelse={(
                                                            nyYtelse: TYtelse | undefined
                                                        ): void => field.onChange(nyYtelse)}
                                                    />
                                                )}
                                            />
                                            <Controller
                                                name="personIdent"
                                                control={metoder.control}
                                                rules={{ pattern: /^[0-9]{11}$/ }}
                                                render={({
                                                    field,
                                                }: {
                                                    field: ControllerRenderProps<
                                                        TilbakeFormData,
                                                        'personIdent'
                                                    >;
                                                }): JSX.Element => (
                                                    <TextField
                                                        label="Fødsels- eller D-nummer fra Dolly"
                                                        size="small"
                                                        className="w-80"
                                                        {...field}
                                                        pattern="[0-9]{11}"
                                                        error={
                                                            metoder.formState.errors.personIdent
                                                                ?.message
                                                        }
                                                    />
                                                )}
                                            />
                                            <Checkbox
                                                {...metoder.register('sendKravgrunnlag')}
                                                size="small"
                                            >
                                                Send kravgrunnlag
                                            </Checkbox>
                                        </HStack>

                                        {watchedYtelse && <Perioder />}
                                    </VStack>

                                    <HStack
                                        gap="space-16"
                                        className="sticky bottom-0 -mx-4 -mb-4 rounded-b-xl bg-ax-bg-default p-4"
                                    >
                                        <HStack gap="space-16" className="grow">
                                            <Button
                                                type="submit"
                                                variant={
                                                    mutation.isSuccess ? 'secondary' : 'primary'
                                                }
                                                loading={mutation.isPending || isSubmitting}
                                            >
                                                Opprett tilbakekreving
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="tertiary"
                                                onClick={resetSkjema}
                                            >
                                                Tøm skjema
                                            </Button>
                                        </HStack>
                                        {mutation.isSuccess && (
                                            <HStack gap="space-24" align="center">
                                                <InlineMessage status="success">
                                                    Tilbakekrevingen er opprettet
                                                </InlineMessage>
                                                <Button
                                                    as="a"
                                                    href={mutation.data.data}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    type="button"
                                                    icon={<ArrowRightIcon />}
                                                    iconPosition="right"
                                                >
                                                    Start behandling
                                                </Button>
                                            </HStack>
                                        )}
                                        {mutation.isError && (
                                            <InlineMessage status="error">
                                                {mutation.error instanceof Error
                                                    ? mutation.error.message
                                                    : 'Opprettingen av tilbakekrevingen feilet'}
                                            </InlineMessage>
                                        )}
                                    </HStack>
                                </VStack>
                            </form>
                        </Box>
                    </FormProvider>
                </VStack>
            </VStack>

            <EndreKravgrunnlagModal ref={endreKravgrunnlagModalRef} />
        </div>
    );
};

export default App;
