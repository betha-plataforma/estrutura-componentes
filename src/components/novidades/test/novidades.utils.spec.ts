import { Novidade } from '../novidades.interfaces';
import { sortByDataInicial } from '../novidades.utils';

describe('Testa utilitários de novidades', () => {

  it('ordena a lista de forma descendente por data inicial', async () => {
    const novidadesForaDeOrdem: Novidade[] = [
      { id: '', titulo: '', mensagem: '', dataInicial: '2020-01-01T08:00:00' },
      { id: '', titulo: '', mensagem: '', dataInicial: '2020-01-01T10:00:00' },
      { id: '', titulo: '', mensagem: '', dataInicial: '2020-01-01T09:00:00' },
    ];

    const novidadesOrdenadas = novidadesForaDeOrdem.sort(sortByDataInicial);

    expect(novidadesOrdenadas[0].dataInicial).toEqual('2020-01-01T10:00:00');
    expect(novidadesOrdenadas[1].dataInicial).toEqual('2020-01-01T09:00:00');
    expect(novidadesOrdenadas[2].dataInicial).toEqual('2020-01-01T08:00:00');
  });

});
