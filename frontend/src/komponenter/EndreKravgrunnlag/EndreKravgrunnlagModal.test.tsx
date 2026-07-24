import type { UserEvent } from '@testing-library/user-event';
import type { JSX } from 'react';
import type { HentKravgrunnlagVariabler, LagreKravgrunnlagVariabler } from '../../api/kravgrunnlag';
import type { EndreKravgrunnlagPeriode } from '../../typer/endreKravgrunnlag';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useEffect, useRef } from 'react';

import { hentKravgrunnlagMutationKey, lagreKravgrunnlagMutationKey } from '../../api/kravgrunnlag';
import { EndreKravgrunnlagModal } from './EndreKravgrunnlagModal';

type HentKravgrunnlag = (
    variabler: HentKravgrunnlagVariabler
) => Promise<EndreKravgrunnlagPeriode[]>;

type LagreKravgrunnlag = (variabler: LagreKravgrunnlagVariabler) => Promise<void>;

const enPeriode: EndreKravgrunnlagPeriode[] = [
    { datoFra: '2024-01-01', datoTil: '2024-01-31', feilutbetalt: '1500' },
];

const toPerioder: EndreKravgrunnlagPeriode[] = [
    { datoFra: '2024-01-01', datoTil: '2024-01-31', feilutbetalt: '1500' },
    { datoFra: '2024-02-01', datoTil: '2024-02-28', feilutbetalt: '2500' },
];

/**
 * Rendrer modalen slik en bruker møter den: allerede åpnet fra skjermen bak.
 */
const ÅpenModal = (): JSX.Element => {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        ref.current?.showModal();
    }, []);
    return <EndreKravgrunnlagModal ref={ref} />;
};

const lagTestQueryClient = (
    hentKravgrunnlag: HentKravgrunnlag,
    lagreKravgrunnlag: LagreKravgrunnlag
): QueryClient => {
    const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
    });
    queryClient.setMutationDefaults(hentKravgrunnlagMutationKey, {
        mutationFn: hentKravgrunnlag as (variabler: unknown) => Promise<EndreKravgrunnlagPeriode[]>,
    });
    queryClient.setMutationDefaults(lagreKravgrunnlagMutationKey, {
        mutationFn: lagreKravgrunnlag as (variabler: unknown) => Promise<void>,
    });
    return queryClient;
};

const renderModal = (
    hentKravgrunnlag: HentKravgrunnlag = async () => enPeriode,
    lagreKravgrunnlag: LagreKravgrunnlag = async () => undefined
): void => {
    render(
        <QueryClientProvider client={lagTestQueryClient(hentKravgrunnlag, lagreKravgrunnlag)}>
            <ÅpenModal />
        </QueryClientProvider>
    );
};

const modal = (): HTMLElement => screen.getByRole('dialog', { name: 'Endre kravgrunnlaget' });

const eksternFagsystemIdFelt = (): HTMLElement =>
    within(modal()).getByLabelText('Ekstern fagsystem id');
const ytelseVelger = (): HTMLElement => within(modal()).getByLabelText('Ytelse');
const datoFraVelger = (): HTMLElement => within(modal()).getByLabelText('Dato fra');
const datoTilVelger = (): HTMLElement => within(modal()).getByLabelText('Dato til');
const feilutbetaltFelt = (): HTMLElement => within(modal()).getByLabelText('Feilutbetalt');

const hentKravgrunnlagKnapp = (): HTMLElement =>
    within(modal()).getByRole('button', { name: 'Hent kravgrunnlag' });
const endreKravgrunnlagetKnapp = (): HTMLElement =>
    within(modal()).getByRole('button', { name: 'Endre kravgrunnlaget' });
const finnEndreKravgrunnlagetKnapp = (): HTMLElement | null =>
    within(modal()).queryByRole('button', { name: 'Endre kravgrunnlaget' });
const avbrytKnapp = (): HTMLElement => within(modal()).getByRole('button', { name: 'Avbryt' });
const leggTilPeriodeKnapp = (): HTMLElement =>
    within(modal()).getByRole('button', { name: 'Legg til ny periode' });
const finnLeggTilPeriodeKnapp = (): HTMLElement | null =>
    within(modal()).queryByRole('button', { name: 'Legg til ny periode' });
const slettPeriodeKnapp = (nr: number): HTMLElement =>
    within(modal()).getByRole('button', { name: new RegExp(`Slett periode ${nr}`) });

const periodeOverskrift = (nr: number): HTMLElement =>
    within(modal()).getByRole('heading', { name: `Periode ${nr}` });
const finnPeriodeOverskrift = (nr: number): HTMLElement | null =>
    within(modal()).queryByRole('heading', { name: `Periode ${nr}` });
const ventPåPeriodeOverskrift = (nr: number): Promise<HTMLElement> =>
    within(modal()).findByRole('heading', { name: `Periode ${nr}` });

const hentKravgrunnlag = async (user: UserEvent): Promise<void> => {
    await user.type(eksternFagsystemIdFelt(), 'FAGSAK-123');
    await user.selectOptions(ytelseVelger(), 'Barnetrygd');
    await user.click(hentKravgrunnlagKnapp());
    await ventPåPeriodeOverskrift(1);
};

describe('Endre kravgrunnlag', () => {
    let user: UserEvent;

    // jsdom implementerer ikke <dialog>.showModal/close. Aksel Modal bruker disse,
    // så vi polyfiller dem for at modalen skal kunne åpnes/lukkes i tester.
    beforeAll(() => {
        if (!HTMLDialogElement.prototype.showModal) {
            HTMLDialogElement.prototype.showModal = function showModal(): void {
                this.open = true;
            };
        }
        if (!HTMLDialogElement.prototype.close) {
            HTMLDialogElement.prototype.close = function close(): void {
                this.open = false;
                this.dispatchEvent(new Event('close'));
            };
        }
    });

    beforeEach(() => {
        user = userEvent.setup();
    });

    test('bruker møter et henteskjema uten perioder når modalen åpnes', () => {
        renderModal();

        expect(eksternFagsystemIdFelt()).toHaveValue('');
        expect(ytelseVelger()).toBeInTheDocument();
        expect(hentKravgrunnlagKnapp()).toBeInTheDocument();

        expect(finnPeriodeOverskrift(1)).not.toBeInTheDocument();
        expect(finnLeggTilPeriodeKnapp()).not.toBeInTheDocument();
        expect(finnEndreKravgrunnlagetKnapp()).not.toBeInTheDocument();
    });

    test('bruker som prøver å hente uten å fylle ut felt får vite hva som mangler', async () => {
        let antallKall = 0;
        renderModal(async () => {
            antallKall += 1;
            return enPeriode;
        });

        await user.click(hentKravgrunnlagKnapp());

        expect(within(modal()).getByText('Ekstern fagsystem id er påkrevd')).toBeInTheDocument();
        expect(within(modal()).getByText('Ytelsestype er påkrevd')).toBeInTheDocument();
        expect(antallKall).toBe(0);
    });

    test('periodene fylles ut med data fra kravgrunnlaget etter henting', async () => {
        renderModal();

        await hentKravgrunnlag(user);

        expect(periodeOverskrift(1)).toBeInTheDocument();
        expect(datoFraVelger()).toHaveValue('01.01.2024');
        expect(datoTilVelger()).toHaveValue('31.01.2024');
        expect(feilutbetaltFelt()).toHaveValue('1500');
    });

    test('flere perioder fra kravgrunnlaget vises hver for seg', async () => {
        renderModal(async () => toPerioder);

        await hentKravgrunnlag(user);

        expect(periodeOverskrift(1)).toBeInTheDocument();
        expect(periodeOverskrift(2)).toBeInTheDocument();
    });

    test('bruker får feilmelding når henting av kravgrunnlag feiler', async () => {
        renderModal(async () => {
            throw new Error('Klarte ikke hente kravgrunnlag (status 500)');
        });

        await user.type(eksternFagsystemIdFelt(), 'FAGSAK-123');
        await user.selectOptions(ytelseVelger(), 'Barnetrygd');
        await user.click(hentKravgrunnlagKnapp());

        expect(
            await within(modal()).findByText('Klarte ikke hente kravgrunnlag (status 500)')
        ).toBeInTheDocument();
        expect(finnPeriodeOverskrift(1)).not.toBeInTheDocument();
    });

    test('lagre- og legg-til-knapp vises først etter at kravgrunnlaget er hentet', async () => {
        renderModal();

        expect(finnLeggTilPeriodeKnapp()).not.toBeInTheDocument();
        expect(finnEndreKravgrunnlagetKnapp()).not.toBeInTheDocument();

        await hentKravgrunnlag(user);

        expect(leggTilPeriodeKnapp()).toBeInTheDocument();
        expect(endreKravgrunnlagetKnapp()).toBeInTheDocument();
    });

    test('bruker lagrer et hentet kravgrunnlag og modalen lukkes', async () => {
        renderModal();
        const dialog = modal();

        await hentKravgrunnlag(user);
        await user.click(endreKravgrunnlagetKnapp());

        await waitFor(() => expect(dialog).not.toBeVisible());
    });

    test('sender periodene til lagring ved submit', async () => {
        let sendteVariabler: LagreKravgrunnlagVariabler | undefined;
        renderModal(undefined, async variabler => {
            sendteVariabler = variabler;
        });

        await hentKravgrunnlag(user);
        await user.click(endreKravgrunnlagetKnapp());

        await waitFor(() => expect(sendteVariabler).toBeDefined());
        expect(sendteVariabler).toEqual({
            ytelse: 'Barnetrygd',
            eksternFagsystemId: 'FAGSAK-123',
            perioder: enPeriode,
        });
    });

    test('viser feilmelding når lagring feiler', async () => {
        renderModal(undefined, async () => {
            throw new Error('Klarte ikke lagre kravgrunnlag (status 500)');
        });

        await hentKravgrunnlag(user);
        await user.click(endreKravgrunnlagetKnapp());

        expect(
            await within(modal()).findByText('Klarte ikke lagre kravgrunnlag (status 500)')
        ).toBeInTheDocument();
        expect(modal()).toBeVisible();
    });

    test('bruker får beskjed når feilutbetalt-beløpet ikke er et gyldig positivt tall', async () => {
        renderModal();

        await hentKravgrunnlag(user);
        await user.clear(feilutbetaltFelt());
        await user.type(feilutbetaltFelt(), 'ikke-et-tall');
        await user.click(endreKravgrunnlagetKnapp());

        expect(within(modal()).getByText('Beløp må være et positivt tall')).toBeInTheDocument();
    });

    test('bruker kan legge til flere perioder etter henting', async () => {
        renderModal();

        await hentKravgrunnlag(user);
        await user.click(leggTilPeriodeKnapp());
        await user.click(leggTilPeriodeKnapp());

        expect(periodeOverskrift(1)).toBeInTheDocument();
        expect(periodeOverskrift(2)).toBeInTheDocument();
        expect(periodeOverskrift(3)).toBeInTheDocument();
    });

    test('sletteknapp vises kun når det finnes mer enn én periode', async () => {
        renderModal();

        await hentKravgrunnlag(user);

        expect(
            within(modal()).queryByRole('button', { name: /Slett periode/ })
        ).not.toBeInTheDocument();

        await user.click(leggTilPeriodeKnapp());

        expect(within(modal()).getAllByRole('button', { name: /Slett periode/ })).toHaveLength(2);
    });

    test('bruker kan angre en periode ved å slette den', async () => {
        renderModal();

        await hentKravgrunnlag(user);
        await user.click(leggTilPeriodeKnapp());
        expect(periodeOverskrift(2)).toBeInTheDocument();

        await user.click(slettPeriodeKnapp(2));

        expect(finnPeriodeOverskrift(2)).not.toBeInTheDocument();
        expect(periodeOverskrift(1)).toBeInTheDocument();
    });

    test('hentede verdier beholdes når bruker legger til en ny periode', async () => {
        renderModal();

        await hentKravgrunnlag(user);
        await user.click(leggTilPeriodeKnapp());

        expect(within(modal()).getByDisplayValue('1500')).toBeInTheDocument();
    });

    test('bruker kan lukke modalen med Avbryt', async () => {
        renderModal();
        const dialog = modal();

        await user.click(avbrytKnapp());

        expect(dialog).not.toBeVisible();
    });
});
