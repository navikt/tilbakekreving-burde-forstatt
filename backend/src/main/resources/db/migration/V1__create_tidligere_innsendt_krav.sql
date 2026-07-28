CREATE TABLE tidligere_innsendt_krav
(
    id                   BIGSERIAL PRIMARY KEY,
    kravgrunnlag_id      VARCHAR(50) NOT NULL,
    vedtak_id            VARCHAR(50) NOT NULL,
    kode_fagomraade      VARCHAR(50) NOT NULL,
    fagsystem_id         VARCHAR(50) NOT NULL,
    vedtak_id_omgjort    VARCHAR(50) NOT NULL,
    vedtak_gjelder_id    VARCHAR(50) NOT NULL,
    type_gjelder_id      VARCHAR(50) NOT NULL,
    utbetales_til_id     VARCHAR(50) NOT NULL,
    type_utbet_id        VARCHAR(50) NOT NULL,
    enhet_ansvarlig      VARCHAR(50) NOT NULL,
    enhet_bosted         VARCHAR(50) NOT NULL,
    enhet_behandl        VARCHAR(50) NOT NULL,
    saksbeh_id           VARCHAR(50) NOT NULL
);

CREATE TABLE tidligere_innsendt_krav_periode
(
    id                          BIGSERIAL PRIMARY KEY,
    tidligere_innsendt_krav_id  BIGINT      NOT NULL REFERENCES tidligere_innsendt_krav (id) ON DELETE CASCADE,
    fom                         DATE        NOT NULL,
    tom                         DATE        NOT NULL,
    belop_tilbakekreves         BIGINT      NOT NULL
);
