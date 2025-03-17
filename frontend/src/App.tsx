import "@navikt/ds-css/dist/index.css";
import { VStack } from "@navikt/ds-react/Stack";
import { TextField } from "@navikt/ds-react/TextField";
import { Button } from "@navikt/ds-react/Button";
import Perioder from "./komponenter/Perioder";
import Ytelser from "./komponenter/Ytelser";
import { useMutation } from "@tanstack/react-query";
import {
  TilbakeFormDataRequest,
  tilbakeFormDataRequestSchema,
} from "./typer/formData";
import { Periode } from "./typer/periode";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { Alert } from "@navikt/ds-react/Alert";
import { zodResolver } from "@hookform/resolvers/zod";

const postTilbakekreving = async (
  data: TilbakeFormDataRequest
): Promise<null> => {
  const validation = tilbakeFormDataRequestSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      "Validering feilet: " + JSON.stringify(validation.error.errors)
    );
  }

  const response = await fetch("/api/tilbakekreving", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    //backend feilmelding goes here
    throw new Error("Noe gikk galt ved opprettelse av tilbakekreving");
  }

  return response.json();
};

function App() {
  const {
    control,
    handleSubmit,
    reset,
    // watch,
    formState: { errors },
  } = useForm<TilbakeFormDataRequest>({
    defaultValues: {
      perioder: [{ fom: undefined, tom: undefined }],
      ytelse: undefined,
      personIdent: "",
      simulertBeløp: "",
      kravgrunnlagBeløp: "",
    },
    resolver: zodResolver(tilbakeFormDataRequestSchema),
  });

  const mutation = useMutation({
    mutationFn: postTilbakekreving,
    onSuccess: (data) => {
      console.log("Tilbakekreving opprettet:", data);
      reset();
    },
    onError: (error) => {
      console.error("Feil ved opprettelse av tilbakekreving:", error);
    },
  });

  const onSubmit: SubmitHandler<TilbakeFormDataRequest> = (data) => {
    const harAllePerioderGyldigDato = data.perioder.every(
      (periode) => periode.fom && periode.tom
    );

    if (!harAllePerioderGyldigDato || !data.ytelse) {
      console.error("Alle felt må fylles ut før innsending.");
      return; // Stopp innsending hvis ikke alle perioder er fylt ut
    }

    const periodeRequest = data.perioder
      .map((periode) => {
        return {
          fom: periode.fom,
          tom: periode.tom,
        } as Periode;
      })
      .filter((periode) => periode.fom && periode.tom);

    const tilbakeFormData: TilbakeFormDataRequest = {
      perioder: periodeRequest,
      ytelse: data.ytelse,
      personIdent: data.personIdent,
      simulertBeløp: data.simulertBeløp,
      kravgrunnlagBeløp: data.kravgrunnlagBeløp,
    };
    mutation.mutate(tilbakeFormData);
  };

  return (
    <VStack gap="4" className="max-w-2xl mx-auto p-4">
      <h1 className="text-9xl font-bold text-pink-500">Burde forstått 🤔</h1>
      <h2 className="text-xl font-bold">Opprett testdata for tilbakekreving</h2>
      <p>Laget i hackatonet 2025 🌞</p>

      {mutation.isSuccess && (
        <Alert variant="success" className="mb-4">
          <h2>Suksess!</h2>
          <p>Tilbakekreving er opprettet.</p>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap="4">
          <Controller
            name="perioder"
            control={control}
            render={({ field }) => (
              <Perioder
                perioder={field.value.map((periode: Periode) => ({
                  fom: periode.fom,
                  tom: periode.tom,
                  id: crypto.randomUUID(),
                }))}
                setPerioder={(nyePerioder) => field.onChange(nyePerioder)}
                feilMelding={errors.perioder}
              />
            )}
          />
          <Controller
            name="ytelse"
            control={control}
            render={({ field }) => (
              <Ytelser
                valgtYtelse={field.value}
                setValgtYtelse={(nyYtelse) => field.onChange(nyYtelse)}
                feilMelding={errors.ytelse?.message}
              />
            )}
          />

          <Controller
            name="personIdent"
            control={control}
            rules={{ pattern: /^[0-9]{11}$/ }}
            render={({ field }) => (
              <TextField
                label="Fødselsnummer eller D-nummer"
                {...field}
                pattern="[0-9]{11}"
                error={errors.personIdent?.message}
              />
            )}
          />

          <Controller
            name="simulertBeløp"
            control={control}
            render={({ field }) => (
              <TextField
                label="Simulert feilutbetalt beløp"
                {...field}
                type="text"
                inputMode="text"
                error={errors.simulertBeløp?.message}
              />
            )}
          />

          <Controller
            name="kravgrunnlagBeløp"
            control={control}
            render={({ field }) => (
              <TextField
                label="Kravgrunnlag feilutbetalt beløp (faktisk beløp)"
                {...field}
                type="text"
                inputMode="text"
                error={errors.kravgrunnlagBeløp?.message}
              />
            )}
          />

          {mutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              <p className="font-bold">Feil ved innsending:</p>
              <p>{String(mutation.error)}</p>
            </div>
          )}

          <Button type="submit" variant="primary" loading={mutation.isPending}>
            Oppretter tilbakekreving
          </Button>
        </VStack>
      </form>
    </VStack>
  );
}

export default App;
