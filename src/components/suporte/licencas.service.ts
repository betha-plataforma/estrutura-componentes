import { Api } from '../../global/api';
import { AuthorizationConfig } from '../../global/interfaces';

export class LicencasService {

  private licencasApi: Api;

  constructor(authorization: AuthorizationConfig, licencasApi: string) {
    this.licencasApi = new Api(authorization.getAuthorization(), authorization.handleUnauthorizedAccess, licencasApi);
  }

  async carregarAtendimento(): Promise<any> {
    return this.licencasApi.request('GET', 'api/atendimento')
      .then(res => res.json());
  }
}
