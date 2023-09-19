import { Api } from '../../global/api';
import { AuthorizationConfig } from '../../global/interfaces';

export class PesquisaService {

  private pesquisaApi: Api;
  private licencasApi: Api;

  constructor(authorization: AuthorizationConfig, pesquisaApi: string, licencasApi: string) {
    this.pesquisaApi = new Api(authorization.getAuthorization(), authorization.handleUnauthorizedAccess, pesquisaApi);
    this.licencasApi = new Api(authorization.getAuthorization(), authorization.handleUnauthorizedAccess, licencasApi);
  }

  async carregarIdPesquisa(): Promise<any> {
    return this.licencasApi.request('GET', 'api/entidades/atual/id-pesquisa')
      .then(res => res.json());
  }

  async idPesquisaEmAberto(idPesquisa, theme) {
    return this.pesquisaApi.request('GET', `index.jsp?id=${ idPesquisa }&e=1&theme=${theme}&reload=${ new Date().getTime() }`)
      .then(response =>  response.text())
      .then(responseText => responseText === 'true');
  }

}
