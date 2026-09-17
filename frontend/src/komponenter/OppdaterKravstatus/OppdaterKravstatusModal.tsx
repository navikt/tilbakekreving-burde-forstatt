import type { ChangeEvent, JSX, RefObject } from 'react';
import type { OppdaterKravstatusVariabler } from '../../api/kravstatus';
import type { EndreKravgrunnlagPeriode } from '../../typer/endreKravgrunnlag';
import type { KravstatusFormData, Kravstatustype } from '../../typer/kravstatus';

import { zodResolver } from '@hookform/resolvers/zod';
import { MagnifyingGlassIcon } from '@navikt/aksel-icons';
import {
    Alert,
    BodyLong,
    BodyShort,
    Box,
    Button,
    HGrid,
    Label,
    Loader,
    Modal,
    TextField,
    VStack,
} from '@navikt/ds-react';
import { useMutation } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { hentKravgrunnlagMutationKey } from '../../api/kravgrunnlag';
import { oppdaterKravstatusMutationKey } from '../../api/kravstatus';
import { kravstatusSchema } from '../../typer/kravstatus';

interface Props {
    ref: RefObject<HTMLDialogElement | null>;
    statustype: Kravstatustype;
}

type Tekster = {
    overskrift: string;
    beskrivelse: string;
    advarsel: string;
    advarselVariant: 'warning' | 'info';
    bekreftKnapp: string;
    bekreftFarge: 'danger' | 'accent';
    kvitteringOverskrift: string;
};

const tekster: Record<Kravstatustype, Tekster> = {
    bortfalt: {
        overskrift: 'Meld kravgrunnlaget bortfalt',
        beskrivelse:
            'Sender en statusmelding (AVSL) på saken. Perioder og beløp i kravgrunnlaget endres ikke.',
        advarsel: 'Statusen kan ikke reverseres herfra.',
        advarselVariant: 'warning',
        bekreftKnapp: 'Meld bortfalt',
        bekreftFarge: 'danger',
        kvitteringOverskrift: 'Kravgrunnlaget er meldt bortfalt',
    },
    sperr: {
        overskrift: 'Sperr kravgrunnlaget',
        beskrivelse:
            'Sender en statusmelding (SPER) på saken. Perioder og beløp i kravgrunnlaget endres ikke.',
        advarsel: 'Sperringen oppheves ved å sende inn et nytt kravgrunnlag.',
        advarselVariant: 'info',
        bekreftKnapp: 'Sperr sak',
        bekreftFarge: 'accent',
        kvitteringOverskrift: 'Kravgrunnlaget er sperret',
    },
};

const beløpFormat = new Intl.NumberFormat('nb-NO');

const tilVisningsdato = (dato: string): string => format(parseISO(dato), 'dd.MM.yyyy');

const summerFeilutbetalt = (perioder: EndreKravgrunnlagPeriode[]): number =>
    perioder.reduce(
        (sum: number, periode: EndreKravgrunnlagPeriode) =>
            sum + Number(periode.feilutbetalt.replace(',', '.')),
        0
    );

const periodespenn = (perioder: EndreKravgrunnlagPeriode[]): string => {
    const datoerFra = perioder.map((periode): string => periode.datoFra).sort();
    const datoerTil = perioder.map((periode): string => periode.datoTil).sort();
    return `${tilVisningsdato(datoerFra[0])}–${tilVisningsdato(datoerTil[datoerTil.length - 1])}`;
};

interface OppsummeringsradProps {
    etikett: string;
    verdi: string;
}

const Oppsummeringsrad = ({ etikett, verdi }: OppsummeringsradProps): JSX.Element => (
    <HGrid columns="8rem auto" gap="space-8">
        <Label size="small">{etikett}</Label>
        <BodyShort size="small">{verdi}</BodyShort>
    </HGrid>
);

export const OppdaterKravstatusModal = ({ ref, statustype }: Props): JSX.Element => {
    const tekst = tekster[statustype];
    const [hentetSak, setHentetSak] = useState<EndreKravgrunnlagPeriode[] | undefined>(undefined);

    const {
        handleSubmit,
        register,
        reset,
        getValues,
        trigger,
        formState: { errors },
    } = useForm<KravstatusFormData>({
        resolver: zodResolver(kravstatusSchema),
        defaultValues: { eksternFagsystemId: '' },
        reValidateMode: 'onChange',
        mode: 'onSubmit',
    });

    const hentKravgrunnlagMutation = useMutation<
        EndreKravgrunnlagPeriode[],
        Error,
        { eksternFagsystemId: string }
    >({
        mutationKey: hentKravgrunnlagMutationKey,
        onSuccess: (perioder: EndreKravgrunnlagPeriode[]): void => setHentetSak(perioder),
    });

    const oppdaterKravstatusMutation = useMutation<
        string | undefined,
        Error,
        OppdaterKravstatusVariabler
    >({
        mutationKey: oppdaterKravstatusMutationKey,
    });

    const erOppdatert = oppdaterKravstatusMutation.isSuccess;

    const håndterHentSak = async (): Promise<void> => {
        const erGyldig = await trigger(['eksternFagsystemId']);
        if (!erGyldig) {
            return;
        }

        const { eksternFagsystemId } = getValues();
        hentKravgrunnlagMutation.mutate({ eksternFagsystemId });
    };

    const lukk = (): void => {
        ref.current?.close();
    };

    const nullstill = (): void => {
        reset();
        setHentetSak(undefined);
        hentKravgrunnlagMutation.reset();
        oppdaterKravstatusMutation.reset();
    };

    const { onChange: onEksternFagsystemIdChange, ...eksternFagsystemIdFelt } =
        register('eksternFagsystemId');

    const onSubmit = (data: KravstatusFormData): void => {
        oppdaterKravstatusMutation.mutate({
            eksternFagsystemId: data.eksternFagsystemId,
            statustype,
        });
    };

    return (
        <Modal
            ref={ref}
            header={{ heading: erOppdatert ? tekst.kvitteringOverskrift : tekst.overskrift }}
            width={erOppdatert ? '400px' : '500px'}
            onClose={nullstill}
        >
            {erOppdatert ? (
                <>
                    <Modal.Body>
                        <BodyLong size="small">Du kan gå videre til behandlingen</BodyLong>
                    </Modal.Body>
                    <Modal.Footer>
                        {oppdaterKravstatusMutation.data && (
                            <Button
                                as="a"
                                href={oppdaterKravstatusMutation.data}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                onClick={lukk}
                            >
                                Gå til behandling
                            </Button>
                        )}
                        <Button size="small" type="button" variant="secondary" onClick={lukk}>
                            Lukk
                        </Button>
                    </Modal.Footer>
                </>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <VStack gap="space-24">
                            <BodyLong size="small" textColor="subtle">
                                {tekst.beskrivelse}
                            </BodyLong>

                            <HGrid columns="1fr auto" align="start" gap="space-16">
                                <TextField
                                    label="Ekstern fagsystem id"
                                    size="small"
                                    className="flex-1"
                                    {...eksternFagsystemIdFelt}
                                    onChange={async (
                                        event: ChangeEvent<HTMLInputElement>
                                    ): Promise<void> => {
                                        setHentetSak(undefined);
                                        oppdaterKravstatusMutation.reset();
                                        await onEksternFagsystemIdChange(event);
                                    }}
                                    error={errors.eksternFagsystemId?.message}
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="small"
                                    className="mt-7"
                                    icon={<MagnifyingGlassIcon aria-hidden />}
                                    onClick={håndterHentSak}
                                    loading={hentKravgrunnlagMutation.isPending}
                                >
                                    Hent sak
                                </Button>
                            </HGrid>

                            {hentKravgrunnlagMutation.isError && (
                                <Alert variant="error" size="small">
                                    {hentKravgrunnlagMutation.error.message}
                                </Alert>
                            )}

                            {hentKravgrunnlagMutation.isPending && (
                                <Loader size="large" title="Henter sak" className="self-center" />
                            )}

                            {hentetSak && (
                                <>
                                    <Box
                                        borderWidth="1"
                                        borderColor="neutral-subtle"
                                        borderRadius="8"
                                        padding="space-16"
                                    >
                                        <VStack gap="space-8">
                                            <Oppsummeringsrad
                                                etikett="Perioder"
                                                verdi={String(hentetSak.length)}
                                            />
                                            <Oppsummeringsrad
                                                etikett="Periode"
                                                verdi={periodespenn(hentetSak)}
                                            />
                                            <Oppsummeringsrad
                                                etikett="Feilutbetalt"
                                                verdi={`${beløpFormat.format(summerFeilutbetalt(hentetSak))} kr`}
                                            />
                                        </VStack>
                                    </Box>

                                    <Alert variant={tekst.advarselVariant} size="small">
                                        {tekst.advarsel}
                                    </Alert>
                                </>
                            )}

                            {oppdaterKravstatusMutation.isError && (
                                <Alert variant="error" size="small">
                                    {oppdaterKravstatusMutation.error.message}
                                </Alert>
                            )}
                        </VStack>
                    </Modal.Body>
                    <Modal.Footer>
                        {hentetSak && (
                            <Button
                                size="small"
                                type="submit"
                                data-color={tekst.bekreftFarge}
                                loading={oppdaterKravstatusMutation.isPending}
                            >
                                {tekst.bekreftKnapp}
                            </Button>
                        )}
                        <Button size="small" type="button" variant="secondary" onClick={lukk}>
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </form>
            )}
        </Modal>
    );
};
