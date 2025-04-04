import "@navikt/ds-css/dist/index.css";
import { HStack, VStack } from "@navikt/ds-react/Stack";
import { TextField } from "@navikt/ds-react/TextField";
import { Button } from "@navikt/ds-react/Button";

import Ytelse from "./komponenter/Ytelse";
import { useMutation } from "@tanstack/react-query";
import {
  TilbakeFormData,
  tilbakeFormDataSchema,
  TilbakeRequest,
} from "./typer/formData";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { Alert } from "@navikt/ds-react/Alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "./komponenter/Header";
import { useRef, useState } from "react";
import { Link } from "@navikt/ds-react";
import { format } from "date-fns";
import Perioder from "./komponenter/Perioder/Perioder";

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
    throw new Error("Noe gikk galt ved opprettelse av tilbakekreving");
  }

  const responseData: TilbakekrevingResponse = await response.json();

  if (responseData.frontendFeilmelding) {
    throw new Error(responseData.frontendFeilmelding);
  }

  return responseData;
};

function App() {
  const svarMeldingRef = useRef<HTMLDivElement>(null);
  const [sisteSendtInnData, setSisteSendtInnData] = useState<
    TilbakeRequest | undefined
  >(undefined);
  const metoder = useForm<TilbakeFormData>({
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
    resolver: zodResolver(tilbakeFormDataSchema),
  });
  const {
    watch,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = metoder;

  const watchedYtelse = watch("ytelse");
  const mutation = useMutation({
    mutationFn: (formData: TilbakeFormData) => {
      const requestObject = {
        ...formData,
        perioder: formData.perioder.map((periode) => {
          const periodeUtenId = {
            fom: periode.fom,
            tom: periode.tom,
            simulertBeløp: Number(periode.simulertBeløp),
            kravgrunnlagBeløp: Number(periode.kravgrunnlagBeløp),
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
    onMutate: () => {
      setTimeout(() => {
        if (svarMeldingRef.current) {
          svarMeldingRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 200);
    },
  });

  const resetSkjema = () => {
    reset();
    mutation.reset();
    setSisteSendtInnData(undefined);
  };

  return (
    <>
      <Header />
      <VStack gap="4" className="max-w-3xl mx-auto p-4">
        <h2 className="text-8xl font-bold text-pink-500">Burde forstått 🤔</h2>
        <h3 className="text-xl font-bold">
          Opprett testdata for tilbakekreving
        </h3>
        <p>Laget i hackatonet 2025 🌞</p>

        <FormProvider {...metoder}>
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
            <VStack gap="4">
              <HStack gap="4">
                <Controller
                  name="ytelse"
                  control={metoder.control}
                  render={({ field }) => (
                    <Ytelse
                      setValgtYtelse={(nyYtelse) => field.onChange(nyYtelse)}
                    />
                  )}
                />
                <Controller
                  name="personIdent"
                  control={metoder.control}
                  rules={{ pattern: /^[0-9]{11}$/ }}
                  render={({ field }) => (
                    <TextField
                      label="Fødselsnummer eller D-nummer"
                      {...field}
                      pattern="[0-9]{11}"
                      error={metoder.formState.errors.personIdent?.message}
                    />
                  )}
                />
              </HStack>

              {watchedYtelse && <Perioder />}

              {mutation.isError && (
                <div
                  ref={svarMeldingRef}
                  className="p-4 bg-red-50 border border-red-200 text-red-700 rounded"
                >
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
                  Opprett tilbakekreving
                </Button>
                <Button variant="secondary" onClick={resetSkjema}>
                  Tilbakestill skjemaet
                </Button>
              </HStack>
            </VStack>
          </form>
        </FormProvider>

        {mutation.isSuccess && (
          <Alert ref={svarMeldingRef} variant="success" className="mb-4">
            <h3>Suksess! 🎉</h3>
            <Link
              href={mutation.data.data}
              target="_blank"
              rel="noopener noreferrer"
            >
              Opprettet tilbakekreving her
            </Link>
          </Alert>
        )}
      </VStack>
    </>
  );
}

export default App;
