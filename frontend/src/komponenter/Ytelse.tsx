import { Select } from "@navikt/ds-react";
import { Ytelse as TYtelse, ytelseGrupper } from "../typer/ytelse";
import { useFormContext } from "react-hook-form";
import { TilbakeFormData } from "../typer/formData";

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
      value={ytelse || ""}
      onChange={(e) => setValgtYtelse(e.target.value as TYtelse)}
      error={errors.ytelse?.message}
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
