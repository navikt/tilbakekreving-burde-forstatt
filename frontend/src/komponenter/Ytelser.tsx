import { Select } from "@navikt/ds-react";
import { Ytelse, ytelseGrupper } from "../typer/ytelse";

interface Props {
  valgtYtelse: Ytelse | null;
  setValgtYtelse: (ytelse: Ytelse | null) => void;
}

const Ytelser = ({ valgtYtelse, setValgtYtelse }: Props) => {
  return (
    <Select
      label="Ytelser"
      value={
        valgtYtelse ? `${valgtYtelse.fagsystem}:${valgtYtelse.ytelse}` : ""
      }
      onChange={(e) => {
        const [fagsystem, ytelse] = e.target.value.split(":");
        setValgtYtelse(e.target.value ? { fagsystem, ytelse } : null);
      }}
    >
      <option value="">Velg ytelse</option>
      {ytelseGrupper.map((gruppe) => (
        <optgroup key={gruppe.fagsystem} label={gruppe.fagsystem}>
          {gruppe.ytelser.map((ytelse) => (
            <option key={`${gruppe}:${ytelse}`} value={`${gruppe}:${ytelse}`}>
              {ytelse}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
};

export default Ytelser;
