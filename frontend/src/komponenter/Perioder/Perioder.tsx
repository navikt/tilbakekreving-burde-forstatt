import { PlusIcon } from "@navikt/aksel-icons";
import { HStack, Button, TextField } from "@navikt/ds-react";
import { VStack } from "@navikt/ds-react";
import { TrashIcon } from "@navikt/aksel-icons";
import {
  Control,
  Controller,
  FieldArrayWithId,
  useFieldArray,
} from "react-hook-form";
import { TilbakeFormData } from "../../typer/formData";
import { Maanedsvelger } from "./Maanedsvelger";
import { Dagvelger } from "./Dagvelger";
import { månedsytelser, Ytelse } from "../../typer/ytelse";

export type TilbakekrevingControl = Control<TilbakeFormData>;
export type PeriodeFeilmelding =
  | {
      message?: string;
      [index: number]:
        | {
            fom?: { message?: string };
            tom?: { message?: string };
            simulertBeløp?: { message?: string };
            kravgrunnlagBeløp?: { message?: string };
          }
        | undefined;
    }
  | undefined;

interface PeriodeInputProps {
  indeks: number;
  control: TilbakekrevingControl;
  ytelse: Ytelse;
  feilMelding?: PeriodeFeilmelding;
}

const Periode = ({
  indeks,
  feilMelding,
  control,
  ytelse,
}: PeriodeInputProps) => {
  return (
    <VStack className="border-4 p-5 border-purple-500 rounded-lg" gap="4">
      <h3 className="font-bold text-blue-700">Periode {indeks + 1}</h3>
      {månedsytelser.includes(ytelse) ? (
        <Maanedsvelger
          control={control}
          indeks={indeks}
          feilmelding={feilMelding}
        />
      ) : (
        <Dagvelger
          control={control}
          indeks={indeks}
          feilmelding={feilMelding}
        />
      )}

      <Controller
        name={`perioder.${indeks}.simulertBelop`}
        control={control}
        render={({ field }) => (
          <TextField
            label="Simulert feilutbetalt beløp"
            {...field}
            type="text"
            inputMode="text"
            error={feilMelding?.[indeks]?.simulertBeløp?.message}
            ref={field.ref}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        name={`perioder.${indeks}.kravgrunnlagBelop`}
        control={control}
        render={({ field }) => (
          <TextField
            label="Kravgrunnlag beløp"
            {...field}
            type="text"
            inputMode="text"
            error={feilMelding?.[indeks]?.kravgrunnlagBeløp?.message}
            ref={field.ref}
            onBlur={field.onBlur}
          />
        )}
      />
    </VStack>
  );
};

interface Props {
  control: TilbakekrevingControl;
  ytelse: Ytelse;
  feilMelding?: PeriodeFeilmelding;
}

const Perioder = ({ control, ytelse, feilMelding }: Props) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "perioder",
  });

  const leggTilPeriode = () => {
    append({
      fom: new Date(),
      tom: new Date(),
      simulertBelop: "",
      kravgrunnlagBelop: "",
    });
  };

  const fjernPeriode = (id: FieldArrayWithId["id"]) => {
    remove(fields.findIndex((periode) => periode.id === id));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Perioder</h2>
      <VStack gap="4">
        {fields.map((periode) => (
          <HStack key={periode.id} gap="4" align="center">
            <Periode
              indeks={fields.indexOf(periode)}
              ytelse={ytelse}
              feilMelding={feilMelding}
              control={control}
            />

            {fields.length > 1 && (
              <Button
                variant="tertiary"
                size="small"
                icon={<TrashIcon aria-hidden />}
                onClick={() => fjernPeriode(periode.id)}
                type="button"
                className="self-center"
              >
                Fjern
              </Button>
            )}
          </HStack>
        ))}
        <Button
          variant="secondary"
          size="small"
          icon={<PlusIcon aria-hidden />}
          onClick={leggTilPeriode}
          type="button"
          className="self-start"
        >
          Legg til periode
        </Button>
      </VStack>
    </div>
  );
};

export default Perioder;
