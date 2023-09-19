import { Component, Host, h, Prop, Watch, State, ComponentInterface } from '@stencil/core';

import { isValidAuthorizationConfig } from '../../global/api';
import { AuthorizationConfig } from '../../global/interfaces';
import { isNill } from '../../utils/functions';
import { PesquisaService } from './pesquisa.service';

@Component({
  tag: 'bth-pesquisa',
  styleUrl: 'pesquisa.css',
  shadow: true,
})
export class Pesquisa implements ComponentInterface {

  private pesquisaService: PesquisaService;
  private idPesquisa: string;

  @State() pesquisaDisponivel: boolean = false;

  /**
   * Configuração de autorização. É necessária para o componente poder autenticar com os serviços.
   */
  @Prop() readonly authorization: AuthorizationConfig;

  /**
   * URL para a api de pesquisas. Por padrão irá obter do env.js.
   */
  @Prop() readonly pesquisaApi?: string;

  /**
   * URL para a api de licenças. Por padrão irá obter do env.js.
   */
  @Prop() readonly licencasApi?: string;
 
  /**
   * configuração do tema da pesquisa.
   */
  @Prop() readonly theme?: string;

  @Watch('authorization')
  watchAuthorization() {
    this.carregarPesquisaAtual();
  }

  // connectedCallback() {
  //   return this.carregarPesquisaAtual();
  // }

  render() {
    if (this.pesquisaDisponivel) {
      return (
        <Host>
          <slot>
            <iframe
              id="bth-pesquisa--iframe"
              name="bfc-iframe-pesquisa"
              src={ this.getUrlPesquisa() }
              class={ this.theme }
              title="Questionário de Pesquisa de Satisfação - Betha Sistemas"
              width="100%"
              frameborder="0"
              allowtransparency="true"
              scrolling="no"
              sandbox="allow-scripts allow-forms allow-same-origin" />
          </slot>
        </Host>
      );
    }
  }

  private getPesquisaApi(): string {
    if (!isNill(this.pesquisaApi)) {
      return this.pesquisaApi;
    }

    if ('___bth' in window) {
      return window['___bth'].envs.suite['pesquisa'].v1.host;
    }

    return null;
  }

  private getLicencasApi(): string {
    if (!isNill(this.licencasApi)) {
      return this.licencasApi;
    }

    if ('___bth' in window) {
      return window['___bth'].envs.suite['licenses'].v1.host;
    }

    return null;
  }

  private isConfiguracaoApiInconsistente() {
    if (isNill(this.getPesquisaApi())) {
      return true;
    }

    if (isNill(this.getLicencasApi())) {
      return true;
    }

    return !isValidAuthorizationConfig(this.authorization);
  }

  private async carregarPesquisaAtual() {
    if (this.isConfiguracaoApiInconsistente()) {
      console.warn('[bth-pesquisa] O endereço do serviço de pesquisas, de licenças e as credenciais de autenticação devem ser informados. Consulte a documentação do componente.');
      return;
    }
    try {
      this.pesquisaService = new PesquisaService(this.authorization, this.getPesquisaApi(), this.getLicencasApi());
      this.pesquisaService.carregarIdPesquisa()
        .then(idPesquisa => this.idPesquisa = idPesquisa.id)
        .then(() => this.pesquisaService.idPesquisaEmAberto(this.idPesquisa, this.theme))
        .then(pesquisaDisponivel => this.pesquisaDisponivel = pesquisaDisponivel)
        .then(() => {
          if (this.pesquisaDisponivel) {
            window.addEventListener('message', this.onIframeMessage);
          }
        });
    } catch {
      console.warn('Ocorreu um erro ao carregar a pesquisa de satisfação.');
    }
  }

  private getUrlPesquisa() {
    return `${ this.getPesquisaApi() }/index.jsp?id=${ this.idPesquisa }&theme=${ this.theme }}`;
  }

  private onIframeMessage(event) {
    if (event.data.id !== 'pesquisa') {
      return;
    }
    if (event.data.action === 'survey.submitted.done' || event.data.action === 'survey.skip') {
      document.querySelector('bth-pesquisa').remove();
    }
  }

}
