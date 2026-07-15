import type { UserEvent } from '@testing-library/user-event';
import type { JSX } from 'react';
import type { DatoAlternativ } from '../../typer/endreKravgrunnlag';

import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useEffect, useRef } from 'react';

import { EndreKravgrunnlagModal } from './EndreKravgrunnlagModal';

const fraDatoAlternativer: DatoAlternativ[] = [
    { value: '2024-01-01', label: '01.01.2024' },
    { value: '2024-02-01', label: '01.02.2024' },
];
const tilDatoAlternativer: DatoAlternativ[] = [
    { value: '2024-01-31', label: '31.01.2024' },
    { value: '2024-02-28', label: '28.02.2024' },
];

/**
 * Rendrer modalen slik en saksbehandler møter den: allerede åpnet fra skjermen bak.
 */
const ÅpenModal = (): JSX.Element => {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        ref.current?.showModal();
    }, []);
    return (
        <EndreKravgrunnlagModal
            ref={ref}
            fraDatoAlternativer={fraDatoAlternativer}
            tilDatoAlternativer={tilDatoAlternativer}
        />
    );
};

const renderModal = (): void => {
    render(<ÅpenModal />);
};

const modal = (): HTMLElement => screen.getByRole('dialog', { name: 'Endre kravgrunnlaget' });

const eksternFagsystemIdFelt = (): HTMLElement =>
    within(modal()).getByLabelText('Ekstern fagsystem id');
const datoFraVelger = (): HTMLElement => within(modal()).getByLabelText('Dato fra');
const datoTilVelger = (): HTMLElement => within(modal()).getByLabelText('Dato til');
const feilutbetaltFelt = (): HTMLElement => within(modal()).getByLabelText('Feilutbetalt');

const endreKravgrunnlagetKnapp = (): HTMLElement =>
    within(modal()).getByRole('button', { name: 'Endre kravgrunnlaget' });
const avbrytKnapp = (): HTMLElement => within(modal()).getByRole('button', { name: 'Avbryt' });
const leggTilPeriodeKnapp = (): HTMLElement =>
    within(modal()).getByRole('button', { name: 'Legg til ny periode' });
const slettPeriodeKnapp = (nr: number): HTMLElement =>
    within(modal()).getByRole('button', { name: new RegExp(`Slett periode ${nr}`) });

const periodeOverskrift = (nr: number): HTMLElement =>
    within(modal()).getByRole('heading', { name: `Periode ${nr}` });
const finnPeriodeOverskrift = (nr: number): HTMLElement | null =>
    within(modal()).queryByRole('heading', { name: `Periode ${nr}` });

const fyllUtGyldigPeriode = async (user: UserEvent): Promise<void> => {
    await user.type(eksternFagsystemIdFelt(), 'FAGSAK-123');
    await user.selectOptions(datoFraVelger(), '2024-01-01');
    await user.selectOptions(datoTilVelger(), '2024-01-31');
    await user.type(feilutbetaltFelt(), '1500,50');
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

    test('bruker ser ett tomt periodeskjema klart til utfylling når modalen åpnes', () => {
        renderModal();

        expect(eksternFagsystemIdFelt()).toHaveValue('');
        expect(periodeOverskrift(1)).toBeInTheDocument();
        expect(finnPeriodeOverskrift(2)).not.toBeInTheDocument();
    });

    test('bruker som prøver å lagre et tomt skjema får vite hva som mangler', async () => {
        renderModal();

        await user.click(endreKravgrunnlagetKnapp());

        expect(within(modal()).getByText('Ekstern fagsystem id er påkrevd')).toBeInTheDocument();
        expect(within(modal()).getByText('Dato fra er påkrevd')).toBeInTheDocument();
        expect(within(modal()).getByText('Dato til er påkrevd')).toBeInTheDocument();
        expect(within(modal()).getByText('Beløp må fylles ut')).toBeInTheDocument();

        expect(modal()).toBeVisible();
    });

    test('bruker fyller ut én gyldig periode og lagrer, og modalen lukkes', async () => {
        renderModal();
        const dialog = modal();

        await fyllUtGyldigPeriode(user);
        await user.click(endreKravgrunnlagetKnapp());

        expect(dialog).not.toBeVisible();
    });

    test('bruker får beskjed når feilutbetalt-beløpet ikke er et gyldig positivt tall', async () => {
        renderModal();

        await user.type(feilutbetaltFelt(), 'ikke-et-tall');
        await user.click(endreKravgrunnlagetKnapp());

        expect(within(modal()).getByText('Beløp må være et positivt tall')).toBeInTheDocument();
    });

    test('saksbehandler kan legge til flere perioder for en sak med flere intervaller', async () => {
        renderModal();

        await user.click(leggTilPeriodeKnapp());
        await user.click(leggTilPeriodeKnapp());

        expect(periodeOverskrift(1)).toBeInTheDocument();
        expect(periodeOverskrift(2)).toBeInTheDocument();
        expect(periodeOverskrift(3)).toBeInTheDocument();
    });

    test('sletteknapp vises kun når det finnes mer enn én periode', async () => {
        renderModal();

        expect(
            within(modal()).queryByRole('button', { name: /Slett periode/ })
        ).not.toBeInTheDocument();

        await user.click(leggTilPeriodeKnapp());

        expect(within(modal()).getAllByRole('button', { name: /Slett periode/ })).toHaveLength(2);
    });

    test('bruker kan angre en periode ved å slette den igjen', async () => {
        renderModal();

        await user.click(leggTilPeriodeKnapp());
        expect(periodeOverskrift(2)).toBeInTheDocument();

        await user.click(slettPeriodeKnapp(2));

        expect(finnPeriodeOverskrift(2)).not.toBeInTheDocument();
        expect(periodeOverskrift(1)).toBeInTheDocument();
    });

    test('utfylte verdier i periode 1 beholdes når bruker legger til en ny periode', async () => {
        renderModal();

        await user.type(feilutbetaltFelt(), '999');
        await user.click(leggTilPeriodeKnapp());

        expect(within(modal()).getByDisplayValue('999')).toBeInTheDocument();
    });

    test('bruker kan lukke modalen med Avbryt', async () => {
        renderModal();
        const dialog = modal();

        await user.click(avbrytKnapp());

        expect(dialog).not.toBeVisible();
    });
});
