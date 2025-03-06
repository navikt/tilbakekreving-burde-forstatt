import "@navikt/ds-css/dist/index.css";
import { VStack, HStack } from "@navikt/ds-react/Stack";
import { TextField } from "@navikt/ds-react/TextField";
import { Button } from "@navikt/ds-react/Button";
import { useState } from "react";
import { Select } from "@navikt/ds-react";

function App() {
  const [fodselsnummer, setFodselsnummer] = useState("");
  const [belop, setBelop] = useState("");
  const [fraDato, setFraDato] = useState("");
  const [tilDato, setTilDato] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log({
      fodselsnummer,
      belop,
      fraDato,
      tilDato,
    });
  };

  return (
    <VStack gap="4" className="max-w-2xl mx-auto p-4">
      <h1 className="text-9xl font-bold text-pink-500">Burde forstått 🤔</h1>
      <h2 className="text-xl font-bold">Opprett testdata for tilbakekreving</h2>
      <p>Laget i hackatonet 2025 🌞</p>
      <form onSubmit={handleSubmit}>
        <VStack gap="4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Periode</h2>
            <HStack gap="4">
              <TextField
                label="Fra dato"
                value={fraDato}
                onChange={(e) => setFraDato(e.target.value)}
                placeholder="DD.MM.YYYY"
                type="text"
                pattern="[0-9]{2}.[0-9]{2}.[0-9]{4}"
                error={
                  fraDato && !/^[0-9]{2}.[0-9]{2}.[0-9]{4}$/.test(fraDato)
                    ? "Ugyldig dato"
                    : undefined
                }
              />
              <TextField
                label="Til dato"
                value={tilDato}
                onChange={(e) => setTilDato(e.target.value)}
                placeholder="DD.MM.YYYY"
                type="text"
                pattern="[0-9]{2}.[0-9]{2}.[0-9]{4}"
                error={
                  tilDato && !/^[0-9]{2}.[0-9]{2}.[0-9]{4}$/.test(tilDato)
                    ? "Ugyldig dato"
                    : undefined
                }
              />
            </HStack>
          </div>
          <Select label="Ytelser">
            <optgroup label="Enslig forsørger">
              <option>Overgangsstønad</option>
            </optgroup>
            <optgroup label="Barnetrygd og kontantstøtte">
              <option>Barnetrygd</option>
              <option>Kontantstøtte</option>
            </optgroup>
            <optgroup label="Tilleggstønader">
              <option>Barnetilsyn</option>
              <option>Boutgifter</option>
              <option>Læremidler</option>
            </optgroup>
          </Select>
          <TextField
            label="Fødselsnummer eller D-nummer"
            value={fodselsnummer}
            onChange={(e) => setFodselsnummer(e.target.value)}
            placeholder="11 siffer"
            pattern="[0-9]{11}"
            error={
              fodselsnummer && !/^[0-9]{11}$/.test(fodselsnummer)
                ? "Ugyldig fødselsnummer"
                : undefined
            }
          />

          <TextField
            label="Simulert feilutbetalt beløp"
            value={belop}
            onChange={(e) => setBelop(e.target.value)}
            placeholder="0,00"
            type="number"
            inputMode="decimal"
            error={belop && isNaN(Number(belop)) ? "Ugyldig beløp" : undefined}
          />

          <TextField
            label="Kravgrunnlag feilutbetalt beløp (faktisk beløp)"
            value={belop}
            onChange={(e) => setBelop(e.target.value)}
            placeholder="0,00"
            type="number"
            inputMode="decimal"
            error={belop && isNaN(Number(belop)) ? "Ugyldig beløp" : undefined}
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
