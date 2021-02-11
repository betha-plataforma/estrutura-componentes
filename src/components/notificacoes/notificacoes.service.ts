import { Api, PaginationQueryParams } from '../../global/api';
import { AuthorizationConfig } from '../../global/interfaces';

export class NotificacoesService {

  private api: Api;

  constructor(authorization: AuthorizationConfig, notificacoesApi: string) {
    this.api = new Api(authorization.getAuthorization(), authorization.handleUnauthorizedAccess, notificacoesApi);
  }

  async buscar(params: PaginationQueryParams = { offset: 0, limit: 20 }): Promise<any> {
    return this.api.request('GET', `api/messages/?limit=${params.limit}&offset=${params.offset}`)
      .then(res => res.json());
  }

  async buscarNaoLidas(params: PaginationQueryParams = { offset: 0, limit: 20 }): Promise<any> {
    return this.api.request('GET', `api/messages/unreads/all?limit=${params.limit}&offset=${params.offset}`)
      .then(res => res.json());
  }

  async buscarLidas(params: PaginationQueryParams = { offset: 0, limit: 20 }): Promise<any> {
    return this.api.request('GET', `api/messages/reads?limit=${params.limit}&offset=${params.offset}`)
      .then(res => res.json());
  }

  async buscarEmProgresso(params: PaginationQueryParams = { offset: 0, limit: 20 }): Promise<any> {
    return this.api.request('GET', `api/messages/in-progress?limit=${params.limit}&offset=${params.offset}`)
      .then(res => res.json());
  }

  async clearInProgressUnread(): Promise<any> {
    return this.api.request('DELETE', 'api/messages/in-progress/unread')
      .then(res => res.json());
  }

  async clearUnreads(): Promise<any> {
    return this.api.request('DELETE', 'api/messages/unread?keepInProgress=true')
      .then(res => res.json());
  }

  async setRead(notificationId: string): Promise<Response> {
    return this.api.request('PUT', `api/messages/${notificationId}/read`, true);
  }

  async setUnread(notificationId: string): Promise<any> {
    return this.api.request('PUT', `api/messages/${notificationId}/unread`)
      .then(res => res.json());
  }
}
