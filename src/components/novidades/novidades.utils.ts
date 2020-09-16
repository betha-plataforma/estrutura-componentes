import { Novidade } from './novidades.interfaces';

export const sortByDataInicial = (novidadeA: Novidade, novidadeB: Novidade) => {
  return novidadeA.dataInicial < novidadeB.dataInicial ? 1 : -1;
};
