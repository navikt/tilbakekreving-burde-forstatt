import { PlusIcon } from "@navikt/aksel-icons";
import {
  DatePicker,
  HStack,
  Button,
  useRangeDatepicker,
  TextField,
} from "@navikt/ds-react";
import { VStack } from "@navikt/ds-react";
import { TrashIcon } from "@navikt/aksel-icons";
import {
  Control,
  Controller,
  FieldArrayWithId,
  useFieldArray,
} from "react-hook-form";
import { TilbakeFormDataRequest } from "../typer/formData";

type TilbakekrevingControl = Control<TilbakeFormDataRequest>;
type PeriodeFeilmelding =
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
  feilMelding?: PeriodeFeilmelding;
}

const PeriodeInput = ({ indeks, feilMelding, control }: PeriodeInputProps) => {
  const { fields, update } = useFieldArray({ control, name: "perioder" });
  const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
    onRangeChange: (range) => {
      if (range?.from && range?.to)
        update(indeks, { ...fields[indeks], fom: range.from, tom: range.to });
    },
  });

  return (
    <VStack className="border-4 p-5 border-purple-500 rounded-lg" gap="4">
      <h3 className="font-bold text-blue-700">Periode {indeks + 1}</h3>

      <DatePicker {...datepickerProps} dropdownCaption>
        <HStack gap="4">
          <Controller
            name={`perioder.${indeks}.fom`}
            control={control}
            render={({ field }) => (
              <DatePicker.Input
                {...fromInputProps}
                label="Fra dato"
                error={feilMelding?.[indeks]?.fom?.message}
                ref={field.ref}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            name={`perioder.${indeks}.tom`}
            control={control}
            render={({ field }) => (
              <DatePicker.Input
                {...toInputProps}
                label="Til dato"
                error={feilMelding?.[indeks]?.tom?.message}
                ref={field.ref}
                onBlur={field.onBlur}
              />
            )}
          />
        </HStack>
      </DatePicker>

      <Controller
        name={`perioder.${indeks}.simulertBeløp`}
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
        name={`perioder.${indeks}.kravgrunnlagBeløp`}
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
  feilMelding?: PeriodeFeilmelding;
  control: TilbakekrevingControl;
}

const Perioder = ({ feilMelding, control }: Props) => {
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
            <PeriodeInput
              indeks={fields.indexOf(periode)}
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
