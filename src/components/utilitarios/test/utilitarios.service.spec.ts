import { setGlobalOrWindowProperty } from '../../../../test/utils/spec.helper';
import { AuthorizationConfig } from '../../../global/interfaces';
import { UtilitariosService } from '../utilitarios.service';

describe('UtilitariosService', () => {
  let service: UtilitariosService;
  let authorization: AuthorizationConfig;

  beforeEach(() => {
    authorization = {
      getAuthorization: () => ({ accessToken: 'ACCESS_TOKEN' }),
      handleUnauthorizedAccess: () => Promise.resolve()
    };

    service = new UtilitariosService(authorization, 'https://utilitarios.test');
  });

  it('busca a lista crua no endpoint /api/utilitarios do host informado', async () => {
    const fetchMock = jest.fn().mockImplementation(() => Promise.resolve({
      status: 200,
      json: () => Promise.resolve([
        { id: '1', nome: 'Auditoria', rota: '/auditoria', icone: 'shield', possuiPermissao: true }
      ])
    }));
    setGlobalOrWindowProperty(global, 'fetch', fetchMock);

    const utilitarios = await service.listar();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://utilitarios.test/api/utilitarios');
    expect(utilitarios).toEqual([
      { nome: 'Auditoria', rota: '/auditoria', icone: 'shield', possuiPermissao: true }
    ]);
  });

  it('assume possuiPermissao true quando ausente na resposta', async () => {
    const fetchMock = jest.fn().mockImplementation(() => Promise.resolve({
      status: 200,
      json: () => Promise.resolve([{ nome: 'X', rota: '/x', icone: 'star' }])
    }));
    setGlobalOrWindowProperty(global, 'fetch', fetchMock);

    const [utilitario] = await service.listar();

    expect(utilitario.possuiPermissao).toBe(true);
  });

  it('propaga erro quando a api-utilitarios responde fora do range 2xx', async () => {
    const fetchMock = jest.fn().mockImplementation(() => Promise.resolve({
      status: 500,
      statusText: 'Internal Server Error'
    }));
    setGlobalOrWindowProperty(global, 'fetch', fetchMock);

    await expect(service.listar()).rejects.toBeDefined();
  });

});
