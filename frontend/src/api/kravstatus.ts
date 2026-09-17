import type { Kravstatustype } from '../typer/kravstatus';

import { tilBehandlingUrl } from './kravgrunnlag';

export const oppdaterKravstatusMutationKey = ['oppdaterKravstatus'] as const;

export type OppdaterKravstatusVariabler = {
    eksternFagsystemId: string;
    statustype: Kravstatustype;
};

export const oppdaterKravstatus = async ({
    eksternFagsystemId,
    statustype,
}: OppdaterKravstatusVariabler): Promise<string | undefined> => {
    const encodedEksternFagsystemId = encodeURIComponent(eksternFagsystemId.trim());

    const response = await fetch(`/api/kravgrunnlag/${encodedEksternFagsystemId}/${statustype}`, {
        method: 'PATCH',
        headers: { Accept: 'application/json' },
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(
            statustype === 'bortfalt'
                ? `Klarte ikke melde kravgrunnlaget bortfalt (status ${response.status})`
                : `Klarte ikke sperre kravgrunnlaget (status ${response.status})`
        );
    }

    return tilBehandlingUrl(await response.json().catch(() => null));
};
