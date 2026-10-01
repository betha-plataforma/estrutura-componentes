const getEpoch = (dateTime: number | string) => new Date(dateTime).getTime();

export const sortByDateTime = (a, b) => {
  return getEpoch(a.dateTime) < getEpoch(b.dateTime) ? 1 : -1;
};

export const concatSemDuplicar = <T extends { id: string }>(atuais: T[], novas: T[]): T[] => {
  const idsListados = new Set(atuais.map(atual => atual.id));
  const novasSemDuplicar = novas.filter(nova => {
    if (idsListados.has(nova.id)) {
      return false;
    }
    idsListados.add(nova.id);
    return true;
  });
  return atuais.concat(novasSemDuplicar);
};
