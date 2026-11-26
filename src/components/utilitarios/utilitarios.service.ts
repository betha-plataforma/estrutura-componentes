import { Api } from '../../global/api';
import { AuthorizationConfig } from '../../global/interfaces';
import { UtilitarioCentral } from './utilitarios.interfaces';

export class UtilitariosService {

  private api: Api;

  constructor(authorization: AuthorizationConfig, utilitariosHost: string) {
    this.api = new Api(authorization.getAuthorization(), authorization.handleUnauthorizedAccess, utilitariosHost);
  }

  /**
   * Lista os utilitários centrais visíveis ao usuário (filtrados pela própria
   * identidade do token + User-Access no servidor). A api-utilitarios devolve
   * um array cru já ordenado por nome.
   */
  async listar(): Promise<Array<UtilitarioCentral>> {
    return this.api.request('GET', 'api/utilitarios')
      .then(response => response.json())
      .then((itens: Array<UtilitarioCentral>) => itens.map(item => ({
        id: item.id,
        nome: item.nome,
        icone: item.icone,
        rota: item.rota,
        possuiPermissao: item.possuiPermissao !== false
      })));
  }

}
