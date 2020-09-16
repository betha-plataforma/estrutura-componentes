import { Api } from '../../global/api';
import { AuthorizationConfig } from '../../global/interfaces';

export class NovidadesService {

  private api: Api;
  private authorization: AuthorizationConfig;

  constructor(authorization: AuthorizationConfig, novidadesApi: string) {
    this.authorization = authorization;
    this.api = new Api(authorization.getAuthorization(), authorization.handleUnauthorizedAccess, novidadesApi);
  }

  async buscar(): Promise<any> {
    return this.api.request('GET', 'api/novidades');
  }

  marcarComoLida(novidadeId: string): void {
    localStorage.setItem(this.construirStorageKey(novidadeId), 'true');
  }

  marcarComoNaoLida(novidadeId: string): void {
    localStorage.removeItem(this.construirStorageKey(novidadeId));
  }

  isLida(novidadeId: string): boolean {
    return localStorage.getItem(this.construirStorageKey(novidadeId)) !== null;
  }

  private construirStorageKey(novidadeId: string): string {
    const { userId } = this.authorization.getAuthorization();
    return `novidades_${userId ?? 'anonimo'}_${novidadeId}`;
  }
}
