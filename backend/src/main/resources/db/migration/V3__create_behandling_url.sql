CREATE TABLE behandling_url
(
    ekstern_fagsak_id  TEXT PRIMARY KEY,
    foresporsel_id     UUID NOT NULL UNIQUE,
    saksbehandling_url TEXT,
    utlopstid         TIMESTAMPTZ NOT NULL
);
