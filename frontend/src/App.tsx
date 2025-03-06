import "@navikt/ds-css/dist/index.css";
import { VStack } from "@navikt/ds-react/Stack";
import { TextField } from "@navikt/ds-react/TextField";
import { Button } from "@navikt/ds-react/Button";
import { useState } from "react";
import { Periode } from "./typer/periode";
import { Ytelse } from "./typer/ytelse";
import Perioder from "./komponenter/Perioder";
import Ytelser from "./komponenter/Ytelser";

const validerBeløp = (beløp: string) => {
  return beløp && isNaN(Number(beløp)) ? "Ugyldig beløp" : undefined;
};

function App() {
  const [perioder, setPerioder] = useState<Periode[]>([
    { fraDato: undefined, tilDato: undefined, id: "" },
  ]);
  const [valgtYtelse, setValgtYtelse] = useState<Ytelse | null>(null);
  const [fodselsnummer, setFodselsnummer] = useState("");
  const [simulertBeløp, setSimulertBeløp] = useState("");
  const [kravgrunnlagBeløp, setKravgrunnlagBeløp] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    // Sjekk om alle påkrevde felter er fylt ut
    const harAllePerioder = perioder.every(
      (periode) => periode.fraDato && periode.tilDato
    );

    if (!harAllePerioder) {
      return; // Stopp innsending hvis ikke alle perioder er fylt ut
    }

    console.log({
      perioder,
      ytelse: valgtYtelse,
      fodselsnummer,
      simulertBeløp,
      kravgrunnlagBeløp,
    });
  };

  console.log("Fra dato useState: ", perioder[0].fraDato);

  return (
    <VStack gap="4" className="max-w-2xl mx-auto p-4">
      <h1 className="text-9xl font-bold text-pink-500">Burde forstått 🤔</h1>
      <h2 className="text-xl font-bold">Opprett testdata for tilbakekreving</h2>
      <p>Laget i hackatonet 2025 🌞</p>
      <form onSubmit={handleSubmit}>
        <VStack gap="4">
          <Perioder
            perioder={perioder}
            setPerioder={setPerioder}
            isSubmitted={isSubmitted}
          />
          <Ytelser valgtYtelse={valgtYtelse} setValgtYtelse={setValgtYtelse} />

          <TextField
            label="Fødselsnummer eller D-nummer"
            value={fodselsnummer}
            onChange={(e) => setFodselsnummer(e.target.value)}
            pattern="[0-9]{11}"
            error={
              isSubmitted && fodselsnummer && !/^[0-9]{11}$/.test(fodselsnummer)
                ? "Ugyldig fødselsnummer"
                : undefined
            }
          />

          <TextField
            label="Simulert feilutbetalt beløp"
            value={simulertBeløp}
            onChange={(e) => setSimulertBeløp(e.target.value)}
            type="text"
            inputMode="text"
            error={isSubmitted ? validerBeløp(simulertBeløp) : undefined}
          />

          <TextField
            label="Kravgrunnlag feilutbetalt beløp (faktisk beløp)"
            value={kravgrunnlagBeløp}
            onChange={(e) => setKravgrunnlagBeløp(e.target.value)}
            type="text"
            inputMode="text"
            error={isSubmitted ? validerBeløp(kravgrunnlagBeløp) : undefined}
          />

          <Button type="submit" variant="primary">
            Opprett tilbakekreving
          </Button>
        </VStack>
      </form>
    </VStack>
  );
}

export default App;
