import { sortByDateTime } from '../notificacoes.utils';

describe('notificacoes utils', () => {
  it('deve ordenar por dateTime', async () => {
    const notificacoesForaDeOrdem = [
      { dateTime: 831719167000 },
      { dateTime: 831719165000 },
      { dateTime: 831719166000 },
    ];

    const notificacoesOrdenadas = notificacoesForaDeOrdem.sort(sortByDateTime);

    expect(notificacoesOrdenadas[0].dateTime).toEqual(831719167000);
    expect(notificacoesOrdenadas[1].dateTime).toEqual(831719166000);
    expect(notificacoesOrdenadas[2].dateTime).toEqual(831719165000);
  });
});
