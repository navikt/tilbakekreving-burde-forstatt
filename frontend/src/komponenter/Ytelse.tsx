import type { TilbakeFormData } from '../typer/formData';
import type { Ytelse as TYtelse } from '../typer/ytelse';

import { Select } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

import { ytelseGrupper } from '../typer/ytelse';

interface Props {
    setValgtYtelse: (ytelse: TYtelse | undefined) => void;
}

const Ytelse = ({ setValgtYtelse }: Props) => {
    const {
        getValues,
        formState: { errors },
    } = useFormContext<TilbakeFormData>();
    const { ytelse } = getValues();
    return (
        <Select
            label="Ytelse"
            description="Ytelser for felles løsning"
            value={ytelse || ''}
            onChange={e => setValgtYtelse(e.target.value as TYtelse)}
            error={errors.ytelse?.message}
        >
            <option value="">Velg ytelse</option>
            {ytelseGrupper.map(gruppe => (
                <optgroup key={gruppe.fagsystem} label={gruppe.fagsystem}>
                    {gruppe.ytelser.map(ytelse => (
                        <option key={`${gruppe}:${ytelse}`} value={ytelse}>
                            {ytelse}
                        </option>
                    ))}
                </optgroup>
            ))}
        </Select>
    );
};

export default Ytelse;
