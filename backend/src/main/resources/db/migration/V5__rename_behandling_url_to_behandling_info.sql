ALTER TABLE behandling_url RENAME TO behandling_info;
ALTER TABLE behandling_info DROP COLUMN foresporsel_id;
ALTER TABLE behandling_info DROP COLUMN utlopstid;
