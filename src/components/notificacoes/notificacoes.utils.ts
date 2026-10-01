const getEpoch = (dateTime: number | string) => new Date(dateTime).getTime();

export const sortByDateTime = (a, b) => {
  return getEpoch(a.dateTime) < getEpoch(b.dateTime) ? 1 : -1;
};

export const concatSemDuplicar = <T extends { id: string }>(atuais: T[], novas: T[]): T[] => {
  const idsAtuais = new Set(atuais.map(atual => atual.id));
  return atuais.concat(novas.filter(nova => !idsAtuais.has(nova.id)));
};
