export const API_HOST = 'https://api.novidades.betha.cloud/v1';

export const PAYLOAD = {
  id: '5ea0a54de26fa800638a91e5',
  titulo: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab, rem!',
  mensagem: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fuga tempora reiciendis, quidem a debitis, omnis, officia facilis at dolor architecto est? Nobis atque cumque dicta.',
  url: 'http://www.google.com.br',
  dataInicial: '2020-04-22T17:03:28',
  dataFinal: '2020-04-23T17:03:28'
};

export function construirLocalStorageKey(userId = 'default.user', novidadeId: string) {
  return `novidades_${userId ?? 'anonimo'}_${novidadeId}`;
}
