import { setupTestingEnvs, setupFetchMock, setFetchMockData, setFetchMockStatus } from '../../../../test/utils/spec.helper';
import { getMockAuthorization } from '../../../global/test/helper/api.helper';
import { NotificacoesService } from '../notificacoes.service';
import { PAYLOAD } from './notificacoes.helper';

describe('notificacoes service', () => {
  const host = 'https://api.notificacoes.betha.cloud/v1';
  const authorization = getMockAuthorization();
  let fetchMock;

  beforeEach(() => {
    setupTestingEnvs();

    fetchMock = setupFetchMock();
    setFetchMockData({ content: [] });
    setFetchMockStatus(200);
  });

  function getExpectedAuthorizationHeaders(method: string = 'GET') {
    return {
      method: method,
      headers: { '_values': [['Authorization', `bearer ${authorization.getAuthorization().accessToken}`]] }
    };
  }

  it('deve buscar de 0 à 20', async () => {
    const service = new NotificacoesService(authorization, host);

    await service.buscar();

    expect(fetchMock)
      .toBeCalledWith(`${host}/api/messages/?limit=20&offset=0`, getExpectedAuthorizationHeaders('GET'));
  });

  it('deve buscar de 20 à 40', async () => {
    const service = new NotificacoesService(authorization, host);

    await service.buscar({ offset: 20, limit: 40 });

    expect(fetchMock)
      .toBeCalledWith(`${host}/api/messages/?limit=40&offset=20`, getExpectedAuthorizationHeaders('GET'));
  });

  it('deve buscar não lidas de 0 à 20', async () => {
    const service = new NotificacoesService(authorization, host);

    await service.buscarNaoLidas();

    expect(fetchMock)
      .toBeCalledWith(`${host}/api/messages/unreads/all?limit=20&offset=0`, getExpectedAuthorizationHeaders('GET'));
  });


  it('deve buscar não lidas de 20 à 40', async () => {
    const service = new NotificacoesService(authorization, host);

    await service.buscarNaoLidas({ offset: 20, limit: 40 });

    expect(fetchMock)
      .toBeCalledWith(`${host}/api/messages/unreads/all?limit=40&offset=20`, getExpectedAuthorizationHeaders('GET'));
  });

  it('deve buscar lidas de 0 à 20', async () => {
    const service = new NotificacoesService(authorization, host);

    await service.buscarLidas();

    expect(fetchMock)
      .toBeCalledWith(`${host}/api/messages/reads?limit=20&offset=0`, getExpectedAuthorizationHeaders('GET'));
  });


  it('deve buscar lidas de 20 à 40', async () => {
    const service = new NotificacoesService(authorization, host);

    await service.buscarLidas({ offset: 20, limit: 40 });

    expect(fetchMock)
      .toBeCalledWith(`${host}/api/messages/reads?limit=40&offset=20`, getExpectedAuthorizationHeaders('GET'));
  });

  it('deve buscar em progresso de 0 à 20', async () => {
    const service = new NotificacoesService(authorization, host);

    await service.buscarEmProgresso();

    expect(fetchMock)
      .toBeCalledWith(`${host}/api/messages/in-progress?limit=20&offset=0`, getExpectedAuthorizationHeaders('GET'));
  });


  it('deve buscar em progresso de 20 à 40', async () => {
    const service = new NotificacoesService(authorization, host);

    await service.buscarEmProgresso({ offset: 20, limit: 40 });

    expect(fetchMock)
      .toBeCalledWith(`${host}/api/messages/in-progress?limit=40&offset=20`, getExpectedAuthorizationHeaders('GET'));
  });

  it('deve limpar em progresso não lidas', async () => {
    const service = new NotificacoesService(authorization, host);

    await service.clearInProgressUnread();

    expect(fetchMock)
      .toBeCalledWith(`${host}/api/messages/in-progress/unread`, getExpectedAuthorizationHeaders('DELETE'));
  });

  it('deve limpar não lidas', async () => {
    const service = new NotificacoesService(authorization, host);

    await service.clearUnreads();

    expect(fetchMock)
      .toBeCalledWith(`${host}/api/messages/unread?keepInProgress=true`, getExpectedAuthorizationHeaders('DELETE'));
  });

  it('deve marcar como lida', async () => {
    const service = new NotificacoesService(authorization, host);

    await service.setRead(PAYLOAD.id);

    expect(fetchMock)
      .toBeCalledWith(`${host}/api/messages/${PAYLOAD.id}/read`, getExpectedAuthorizationHeaders('PUT'));
  });

  it('deve marcar como não lida', async () => {
    const service = new NotificacoesService(authorization, host);

    await service.setUnread(PAYLOAD.id);

    expect(fetchMock)
      .toBeCalledWith(`${host}/api/messages/${PAYLOAD.id}/unread`, getExpectedAuthorizationHeaders('PUT'));
  });

});
