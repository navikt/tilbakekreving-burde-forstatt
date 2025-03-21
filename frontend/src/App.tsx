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
import { useForm, Controller } from "react-hook-form";
import { Alert } from "@navikt/ds-react/Alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "./komponenter/Header";
import { useState } from "react";

const postTilbakekreving = async (
  data: TilbakeFormDataRequest
): Promise<null> => {
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
  const [sisteSendtInnData, setSisteSendtInnData] =
    useState<TilbakeFormDataRequest | null>(null);
  const {
    getValues,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TilbakeFormDataRequest>({
    defaultValues: {
      perioder: [
        {
          fom: undefined,
          tom: undefined,
          simulertBeløp: "",
          kravgrunnlagBeløp: "",
        },
      ],
      ytelse: undefined,
      personIdent: "",
    },
    mode: "onChange",
    resolver: zodResolver(tilbakeFormDataRequestSchema),
  });

  const mutation = useMutation({
    mutationFn: postTilbakekreving,
    onSuccess: () => reset(),
    onError: () => setSisteSendtInnData(getValues()),
  });

  return (
    <>
      <Header />
      <VStack gap="4" className="max-w-2xl mx-auto p-4">
        <h2 className="text-9xl font-bold text-pink-500">Burde forstått 🤔</h2>
        <h3 className="text-xl font-bold">
          Opprett testdata for tilbakekreving
        </h3>
        <p>Laget i hackatonet 2025 🌞</p>

        {mutation.isSuccess && (
          <Alert variant="success" className="mb-4">
            <h3>Suksess!</h3>
            <p>Tilbakekreving er opprettet.</p>
          </Alert>
        )}

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <VStack gap="4">
            <Perioder feilMelding={errors.perioder} control={control} />

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

            {mutation.isError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                <p className="font-bold">Feil ved innsending:</p>
                <p>{String(mutation.error)}</p>
                <div className="mt-4">
                  <p className="font-bold">Data som ble forsøkt sendt:</p>
                  <pre className="bg-slate-100 p-3 mt-2 rounded overflow-auto max-h-96 text-xs">
                    {JSON.stringify(sisteSendtInnData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={mutation.isPending || isSubmitting}
            >
              Oppretter tilbakekreving
            </Button>
          </VStack>
        </form>
      </VStack>
    </>
  );
}

export default App;
