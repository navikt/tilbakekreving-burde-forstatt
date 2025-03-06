export type Ytelse = {
  fagsystem: string;
  ytelse: string;
};

export const ytelseGrupper = [
  {
    fagsystem: "Enslig forsørger",
    ytelser: ["Overgangsstønad"],
  },
  {
    fagsystem: "Barnetrygd og kontantstøtte",
    ytelser: [ "Barnetrygd", "Kontantstøtte"],
  },
];
