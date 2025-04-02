import { Select } from "@navikt/ds-react";
import { Ytelse as TYtelse, ytelseGrupper } from "../typer/ytelse";

interface Props {
  valgtYtelse: TYtelse | undefined;
  feilMelding?: string;
  setValgtYtelse: (ytelse: TYtelse | undefined) => void;
}

const Ytelse = ({ valgtYtelse, setValgtYtelse, feilMelding }: Props) => {
  return (
    <Select
      label="Ytelse"
      value={valgtYtelse || ""}
      onChange={(e) => setValgtYtelse(e.target.value as TYtelse)}
      error={feilMelding}
    >
      <option value="">Velg ytelse</option>
      {ytelseGrupper.map((gruppe) => (
        <optgroup key={gruppe.fagsystem} label={gruppe.fagsystem}>
          {gruppe.ytelser.map((ytelse) => (
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
