CREATE TABLE innsendt_statusmelding
(
    id                   BIGSERIAL PRIMARY KEY,
    kravgrunnlag_id      VARCHAR(50) NOT NULL,
    vedtak_id            VARCHAR(50) NOT NULL,
    kode_status_krav     VARCHAR(50) NOT NULL,
    kode_fagomraade      VARCHAR(50) NOT NULL,
    fagsystem_id         VARCHAR(50) NOT NULL,
    vedtak_gjelder_id    VARCHAR(50) NOT NULL,
    type_gjelder_id      VARCHAR(50) NOT NULL
);
