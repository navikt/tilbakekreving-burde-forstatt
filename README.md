# Frontend – Tilbakekreving burde forstått

## Forutsetninger

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/)

## Kjøre frontend lokalt (uten backend)

```bash
cd frontend
pnpm install
pnpm dev
```

Åpne http://localhost:5173/. API-kall (`/api/me`, `/api/tilbakekreving`) mockes automatisk i dev-modus.

## Kjøre frontend mot backend lokalt

Krever:

- [Docker](https://docs.docker.com/get-docker/) (via Colima eller Docker Desktop)
- Tilgang til Naisdevice og `kubectl` konfigurert mot `dev-gcp`

### 0. Logg inn på nais

Sørg for at du er logget inn med nais:

```
nais auth login
```

### 1. Hent miljøvariabler

```bash
# Fra root
sh ./hent-og-lagre-miljøvariabler.sh
```

Dette genererer `.login.env` med Azure-hemmeligheter for lokal autentisering.

### 2. Start backend

```bash
cd backend
./gradlew bootRun
```

Backend kjører på port 8080.

### 3. Start Wonderwall (autentisering)

```bash
# Fra prosjektrot
docker-compose build && docker-compose up
```

Wonderwall kjører på port 4000 og proxyer til frontend (port 5173).

### 4. Start frontend med backend-proxy

```bash
cd frontend
VITE_USE_BACKEND=true pnpm dev
```

### 5. Åpne appen

Gå til http://localhost:4000/ – du logges inn via Azure AD og trafikken rutes gjennom Wonderwall → Vite → Backend.

## Kodekvalitet

- **Biome** brukes til linting, formatering og import-sortering (erstatter ESLint + Prettier).
- **Husky** + **lint-staged** kjører Biome automatisk ved commit.

| Kommando | Beskrivelse |
| --- | --- |
| `pnpm check` | Biome read-only: linting + formatsjekk + import-sortering (skriver ingenting) |
| `pnpm check:fix` | Biome med automatisk fiks: formaterer, fikser safe lint-regler og sorterer imports |
| `pnpm typecheck` | Kjør `tsc --noEmit` (Biome typesjekker ikke) |

I VS Code:

1. Installer [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)-extensionen.
2. Deaktiver Prettier for workspacet hvis den er aktivert.
3. Biome er satt opp som standard formatter (`.vscode/settings.json`).
