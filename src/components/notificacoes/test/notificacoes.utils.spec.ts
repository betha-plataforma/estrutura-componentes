import { concatSemDuplicar, sortByDateTime } from '../notificacoes.utils';

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

  it('deve ordenar por dateTime misturando epoch e data no formato ISO', async () => {
    const notificacoesForaDeOrdem = [
      { dateTime: 831719165000 },
      { dateTime: '1996-05-10T09:06:07.000+00:00' },
      { dateTime: 831719166000 },
    ];

    const notificacoesOrdenadas = notificacoesForaDeOrdem.sort(sortByDateTime);

    expect(notificacoesOrdenadas.map(notificacao => notificacao.dateTime)).toEqual([
      '1996-05-10T09:06:07.000+00:00',
      831719166000,
      831719165000,
    ]);
  });

  it('deve concatenar ignorando ids já presentes na lista atual', async () => {
    const atuais = [{ id: 'a' }, { id: 'b' }];
    const novas = [{ id: 'b' }, { id: 'c' }];

    expect(concatSemDuplicar(atuais, novas).map(notificacao => notificacao.id)).toEqual(['a', 'b', 'c']);
  });

  it('deve concatenar ignorando ids repetidos dentro das novas', async () => {
    const atuais = [{ id: 'a' }];
    const novas = [{ id: 'c' }, { id: 'c' }, { id: 'd' }];

    expect(concatSemDuplicar(atuais, novas).map(notificacao => notificacao.id)).toEqual(['a', 'c', 'd']);
  });
});
