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
