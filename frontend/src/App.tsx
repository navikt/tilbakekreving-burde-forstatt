import "@navikt/ds-css/dist/index.css";
import { HStack, VStack } from "@navikt/ds-react/Stack";
import { TextField } from "@navikt/ds-react/TextField";
import { Button } from "@navikt/ds-react/Button";
import Perioder from "./komponenter/Perioder";
import Ytelser from "./komponenter/Ytelser";
import { useMutation } from "@tanstack/react-query";
import {
  TilbakeFormData,
  tilbakeFormDataSchema,
  TilbakeRequest,
} from "./typer/formData";
import { useForm, Controller } from "react-hook-form";
import { Alert } from "@navikt/ds-react/Alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "./komponenter/Header";
import { useState } from "react";
import { Link } from "@navikt/ds-react";
import { format } from "date-fns";

type TilbakekrevingResponse = {
  data: string;
  frontendFeilmelding: string;
  melding: string;
  stacktrace: string;
  status: string;
};

const formatterTilYYYYMMDD = (date: Date): string => format(date, "yyyy-MM-dd");

const postTilbakekreving = async (
  data: TilbakeRequest
): Promise<TilbakekrevingResponse> => {
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

  const responseData: TilbakekrevingResponse = await response.json();

  return responseData;
};

function App() {
  const [sisteSendtInnData, setSisteSendtInnData] = useState<
    TilbakeRequest | undefined
  >(undefined);
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TilbakeFormData>({
    defaultValues: {
      perioder: [
        {
          fom: undefined,
          tom: undefined,
          simulertBelop: "",
          kravgrunnlagBelop: "",
        },
      ],
      ytelse: undefined,
      personIdent: "",
    },
    mode: "onChange",
    resolver: zodResolver(tilbakeFormDataSchema),
  });

  const mutation = useMutation({
    mutationFn: (formData: TilbakeFormData) => {
      const requestObject = {
        ...formData,
        perioder: formData.perioder.map((periode) => {
          const periodeUtenId = {
            fom: periode.fom,
            tom: periode.tom,
            simulertBelop: Number(periode.simulertBelop),
            kravgrunnlagBelop: Number(periode.kravgrunnlagBelop),
          };
          return {
            ...periodeUtenId,
            fom: formatterTilYYYYMMDD(periode.fom),
            tom: formatterTilYYYYMMDD(periode.tom),
          };
        }),
      };
      setSisteSendtInnData(requestObject);
      return postTilbakekreving(requestObject);
    },
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
            <HStack gap="4">
              <Button
                type="submit"
                variant="primary"
                loading={mutation.isPending || isSubmitting}
              >
                Oppretter tilbakekreving
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  reset();
                  mutation.reset();
                }}
              >
                Tilbakestill
              </Button>
            </HStack>
          </VStack>
        </form>
        {mutation.isSuccess && (
          <Alert variant="success" className="mb-4">
            <h3>Suksess! 🎉</h3>
            <p>
              {mutation.data.melding}:{" "}
              <Link className="" href={mutation.data.data}>
                her
              </Link>
            </p>
            <p>
              Med dataen:
              <pre className="bg-slate-100 p-3 mt-2 rounded overflow-auto max-h-96 text-xs">
                {JSON.stringify(sisteSendtInnData, null, 2)}
              </pre>
            </p>
          </Alert>
        )}
      </VStack>
    </>
  );
}

export default App;
