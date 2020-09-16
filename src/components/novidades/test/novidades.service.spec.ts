import { setGlobalOrWindowProperty } from '../../../../test/utils/spec.helper';
import { AuthorizationConfig } from '../../../global/interfaces';
import { Novidade } from '../novidades.interfaces';
import { NovidadesService } from '../novidades.service';
import { API_HOST } from './helper/novidades.helper';

describe('NovidadesService', () => {
  let novidadesService: NovidadesService;
  let authorization: AuthorizationConfig;

  beforeEach(() => {
    authorization = {
      getAuthorization: () => {
        return { accessToken: 'ACCESS_TOKEN' };
      },
      handleUnauthorizedAccess: () => Promise.resolve()
    };

    novidadesService = new NovidadesService(authorization, API_HOST);
  });

  it('deve buscar novidades', async () => {
    const novidadesMockedResult: Novidade[] = [
      { id: 'ID_NOVIDADE', titulo: 'TITULO', mensagem: 'MENSAGEM' }
    ];

    const fetchMock = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        status: 200,
        json: jest.fn().mockImplementation(() => Promise.resolve(novidadesMockedResult))
      });
    });

    setGlobalOrWindowProperty(global, 'fetch', fetchMock);

    const novidades = await novidadesService.buscar();

    expect(fetchMock).toBeCalledTimes(1);
    expect(novidades).toBeTruthy();
    expect(novidades).toHaveLength(1);
    expect(novidades[0].id).toEqual(novidadesMockedResult[0].id);
  });

  it('deve lancar erro ao buscar novidades', async () => {
    const INTERNAL_ERROR_STATUS = 500;

    const fetchMock = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        status: INTERNAL_ERROR_STATUS,
        json: jest.fn().mockImplementation(() => Promise.resolve([]))
      });
    });

    setGlobalOrWindowProperty(global, 'fetch', fetchMock);

    await expect(novidadesService.buscar()).rejects.toThrow();
  });

  it('deve marcar como lida no localStorage como usuario anonimo', () => {
    const spy = jest.spyOn(localStorage, 'setItem').mockImplementation();

    authorization.getAuthorization = () => {
      return {
        accessToken: 'ACCESS_TOKEN'
      };
    };

    const novidadeId = 'NOVIDADE_ID';
    novidadesService.marcarComoLida(novidadeId);

    expect(localStorage.setItem).toBeCalledTimes(1);
    expect(localStorage.setItem).toBeCalledWith(`novidades_anonimo_${novidadeId}`, 'true');

    spy.mockRestore();
  });

  it('deve marcar como lida no localStorage como usuario informado', () => {
    const spy = jest.spyOn(localStorage, 'setItem').mockImplementation();

    const userId = 'lorem.ipsum';
    authorization.getAuthorization = () => {
      return { accessToken: 'ACCESS_TOKEN', userId };
    };

    const novidadeId = 'NOVIDADE_ID';
    novidadesService.marcarComoLida(novidadeId);

    expect(localStorage.setItem).toBeCalledTimes(1);
    expect(localStorage.setItem).toBeCalledWith(`novidades_${userId}_${novidadeId}`, 'true');

    spy.mockRestore();
  });

  it('deve marcar como não lida no localStorage como usuario anonimo', () => {
    const spy = jest.spyOn(localStorage, 'removeItem').mockImplementation();

    authorization.getAuthorization = () => {
      return { accessToken: 'ACCESS_TOKEN' };
    };

    novidadesService.marcarComoNaoLida('abc');

    expect(localStorage.removeItem).toBeCalledTimes(1);
    expect(localStorage.removeItem).toBeCalledWith('novidades_anonimo_abc');

    spy.mockRestore();
  });

  it('deve marcar como lida no localStorage como usuario informado', () => {
    const spy = jest.spyOn(localStorage, 'removeItem').mockImplementation();

    const userId = 'lorem.ipsum';
    authorization.getAuthorization = () => {
      return { accessToken: 'ACCESS_TOKEN', userId };
    };

    const novidadeId = 'NOVIDADE_ID';
    novidadesService.marcarComoNaoLida(novidadeId);

    expect(localStorage.removeItem).toBeCalledTimes(1);
    expect(localStorage.removeItem).toBeCalledWith(`novidades_${userId}_${novidadeId}`);

    spy.mockRestore();
  });

  it('deve validar que novidade esta lida', () => {
    const novidadeId = 'NOVIDADE_ID';
    novidadesService.marcarComoLida(novidadeId);
    const isLida = novidadesService.isLida(novidadeId);
    expect(isLida).toBeTruthy();
  });

  it('deve validar que novidade não esta lida', () => {
    const novidadeId = 'NOVIDADE_ID';
    novidadesService.marcarComoNaoLida(novidadeId);
    const isLida = novidadesService.isLida('abc');
    expect(isLida).toBeFalsy();
  });

  it('deve validar que novidade não esta lida', () => {
    const novidadeId = 'NOVIDADE_ID';
    novidadesService.marcarComoNaoLida(novidadeId);
    const isLida = novidadesService.isLida(novidadeId);
    expect(isLida).toBeFalsy();
  });

});
