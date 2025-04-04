import { PlusIcon } from "@navikt/aksel-icons";
import { HStack, Button, TextField } from "@navikt/ds-react";
import { VStack } from "@navikt/ds-react";
import { TrashIcon } from "@navikt/aksel-icons";
import {
  Controller,
  FieldArrayWithId,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import { TilbakeFormData } from "../../typer/formData";
import { Maanedsvelger } from "./Maanedsvelger";
import { Dagvelger } from "./Dagvelger";
import { månedsytelser } from "../../typer/ytelse";

interface PeriodeInputProps {
  indeks: number;
}

const Periode = ({ indeks }: PeriodeInputProps) => {
  const {
    control,
    getValues,
    formState: { errors },
  } = useFormContext<TilbakeFormData>();
  const { ytelse } = getValues();
  return (
    <VStack className="border-4 p-5 border-purple-500 rounded-lg" gap="4">
      <h3 className="font-bold text-blue-700">Periode {indeks + 1}</h3>
      {månedsytelser.includes(ytelse) ? (
        <Maanedsvelger indeks={indeks} />
      ) : (
        <Dagvelger indeks={indeks} />
      )}

      <Controller
        name={`perioder.${indeks}.simulertBeløp`}
        control={control}
        render={({ field }) => (
          <TextField
            label="Simulert feilutbetalt beløp"
            {...field}
            type="text"
            inputMode="text"
            error={errors.perioder?.[indeks]?.simulertBeløp?.message}
          />
        )}
      />
      <Controller
        name={`perioder.${indeks}.kravgrunnlagBeløp`}
        control={control}
        render={({ field }) => (
          <TextField
            label="Kravgrunnlag beløp"
            {...field}
            type="text"
            inputMode="text"
            error={errors.perioder?.[indeks]?.kravgrunnlagBeløp?.message}
          />
        )}
      />
    </VStack>
  );
};

const Perioder = () => {
  const { control } = useFormContext<TilbakeFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "perioder",
  });

  const leggTilPeriode = () => {
    append({
      fom: new Date(),
      tom: new Date(),
      simulertBeløp: "",
      kravgrunnlagBeløp: "",
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
            <Periode indeks={fields.indexOf(periode)} />

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
