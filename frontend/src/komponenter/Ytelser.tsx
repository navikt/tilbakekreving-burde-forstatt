import { Select } from "@navikt/ds-react";
import { Ytelse, ytelseGrupper } from "../typer/ytelse";

interface Props {
  valgtYtelse: Ytelse | undefined;
  feilMelding?: string;
  setValgtYtelse: (ytelse: Ytelse | undefined) => void;
}

const Ytelser = ({ valgtYtelse, setValgtYtelse, feilMelding }: Props) => {
  return (
    <Select
      label="Ytelser"
      value={valgtYtelse}
      onChange={(e) => {
        setValgtYtelse(e.target.value as Ytelse);
      }}
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

export default Ytelser;
