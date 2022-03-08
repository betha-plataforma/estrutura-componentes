import {setGlobalOrWindowProperty} from '../../../../test/utils/spec.helper';
import { AuthorizationConfig } from '../../../global/interfaces';
import { PesquisaService } from '../pesquisa.service';

describe('PesquisaService', () => {
  let pesquisaService: PesquisaService;
  let authorization: AuthorizationConfig;

  beforeEach(() => {
    authorization = {
      getAuthorization: () => {
        return { accessToken: 'ACCESS_TOKEN' };
      },
      handleUnauthorizedAccess: () => Promise.resolve()
    };

    pesquisaService = new PesquisaService(authorization, '', '');
  });

  it('deve carregar id pesquisa', async () => {
    const fetchMock = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        status: 200,
        json: jest.fn().mockImplementation(() => Promise.resolve({
          id: 'ULfX2YEdWmTME5ClExTjwqW-sa4Fz8RmEcTNzxyFRUxzBYDDdemyvfDj_PP9-k-mcZgKTlco0vTzVrkSiQPj01yeJjr3r3uNdEg1wiTZiRamNE1Y9KMtOrye3UFr7G0FArU3DHM='
        }))
      });
    });
    setGlobalOrWindowProperty(global, 'fetch', fetchMock);

    pesquisaService.carregarIdPesquisa();
    expect(fetchMock).toBeCalledTimes(1);
  });

  it('deve verificar se pesquisa está ativa', async () => {
    const fetchMock = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        status: 200,
        text: jest.fn().mockImplementation(() => Promise.resolve('true'))
      });
    });
    setGlobalOrWindowProperty(global, 'fetch', fetchMock);

    const response = await pesquisaService.idPesquisaEmAberto('ULfX2YEdWmTME5ClExTjwqW-sa4Fz8RmEcTNzxyFRUxzBYDDdemyvfDj_PP9-k-mcZgKTlco0vTzVrkSiQPj01yeJjr3r3uNdEg1wiTZiRamNE1Y9KMtOrye3UFr7G0FArU3DHM=');
    expect(fetchMock).toBeCalledTimes(1);
    expect(response).toBe(true);
  });

});
