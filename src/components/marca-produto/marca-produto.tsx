import { Component, Listen, State, h, Prop, Watch, ComponentInterface } from '@stencil/core';

import { Api, isValidAuthorizationConfig } from '../../global/api';
import { TIMEOUT_INTERACOES } from '../../global/constants';
import { AuthorizationConfig } from '../../global/interfaces';
import { isNill, isDispositivoMovel } from '../../utils/functions';
import { PromiseTracker } from '../../utils/promise-tracker';
import { Produto } from './marca-produto.interfaces';

/**
 * Este componente exibe o logo da Betha e o nome do produto
 *
 * Este componente foi elaborado para comportar o slot de "menu_marca_produto"
 */
@Component({
  tag: 'bth-marca-produto',
  styleUrl: 'marca-produto.scss',
  shadow: true
})
export class MarcaProduto implements ComponentInterface {

  private activeTimeoutHandler: number;

  private tracker = new PromiseTracker((active: boolean) => {
    this.isBuscandoProdutos = active;
  });

  @State() produtos: Array<Produto> = [];
  @State() isBuscandoProdutos: boolean = false;
  @State() isApiIndisponivel: boolean = false;
  @State() isDropdownProdutosAberto: boolean = false;
  @State() isDispositivoMovel: boolean = false;

  /**
   * Nome do produto
   */
  @Prop() readonly produto!: string;

  /**
   * Configuração de autorização. É necessária para o componente poder se autentizar com os serviços.
   */
  @Prop() readonly authorization: AuthorizationConfig;

  /**
   * Define se o componente exibirá os produtos, condicionando a busca. Caso informado `false` não irá buscar por produtos.
   */
  @Prop() readonly exibirProdutos?: boolean = false;

  /**
   * URL para a API de user accounts. Por padrão irá obter do env.js
   */
  @Prop() readonly userAccountsApi?: string;

  /**
   * URL para home da suite de usuários. Por padrão irá obter do env.js
   */
  @Prop() readonly suiteHome?: string;

  /**
   * URL para a home da betha store. Por padrão irá obter do env.js
   */
  @Prop() readonly storeHome?: string;

  connectedCallback() {
    this.configurarPropriedadesResponsivas();

    if (this.exibirProdutos) {
      this.buscarProdutos();
    }
  }

  @Listen('resize', { target: 'window' })
  onWindowResize(): void {
    this.configurarPropriedadesResponsivas();
  }

  @Watch('exibirProdutos')
  async watchExibirProdutos(novoValor: boolean) {
    if (novoValor) {
      this.buscarProdutos();
    }
  }

  private async buscarProdutos() {
    if (this.isConfiguracaoApiInconsistente()) {
      console.warn('[bth-marca-produto] O endereço do serviço de contas do usuário e credenciais de autenticação devem ser informados. Consulte a documentação do componente.');
      this.isApiIndisponivel = true;
      return;
    }

    this.isApiIndisponivel = false;

    const authorization = this.authorization.getAuthorization();
    const UserAccountsApi = new Api(authorization, this.authorization.handleUnauthorizedAccess, `${this.getUserAccountsApi()}/api`);

    const promise = UserAccountsApi.request('GET', `access/${authorization.accessId}/systems`)
      .then(res => res.json())
      .then(produtos => {
        this.produtos = produtos.filter((produto: Produto) => produto.id !== authorization.systemId);
      })
      .catch(() => this.isApiIndisponivel = true);

    this.tracker.addPromise(promise);
  }

  private getSuiteHome(): string {
    if (!isNill(this.suiteHome)) {
      return this.suiteHome;
    }

    if ('___bth' in window) {
      return window['___bth']?.envs?.suite?.['suite-ui']?.home?.host;
    }

    return null;
  }

  private getStoreHome(): string {
    if (!isNill(this.storeHome)) {
      return this.storeHome;
    }

    if ('___bth' in window) {
      return window['___bth']?.envs?.suite?.['studio-ui']?.v1?.store;
    }

    return null;
  }

  private getUserAccountsApi(): string {
    if (!isNill(this.userAccountsApi)) {
      return this.userAccountsApi;
    }

    if ('___bth' in window) {
      return window['___bth']?.envs?.suite?.['user-accounts']?.v1?.host;
    }

    return null;
  }

  private isConfiguracaoApiInconsistente(): boolean {
    if (isNill(this.getUserAccountsApi())) {
      return true;
    }

    if (!isValidAuthorizationConfig(this.authorization)) {
      return true;
    }

    return false;
  }

  private configurarPropriedadesResponsivas(): void {
    this.isDispositivoMovel = isDispositivoMovel();
  }

  private cancelarTimeoutAtivo(): void {
    if (this.activeTimeoutHandler !== undefined) {
      clearTimeout(this.activeTimeoutHandler);
      this.activeTimeoutHandler = undefined;
    }
  }

  private alterarEstadoAberto(opened: boolean): void {
    this.activeTimeoutHandler = window.setTimeout(() => {
      this.isDropdownProdutosAberto = opened;
      this.activeTimeoutHandler = undefined;
    }, TIMEOUT_INTERACOES);
  }

  private onMouseOverMenuProduto = (): void => {
    if (this.isDispositivoMovel) {
      return;
    }

    this.cancelarTimeoutAtivo();
    this.alterarEstadoAberto(true);
  }

  private onMouseLeaveMenuProduto = (): void => {
    if (this.isDispositivoMovel) {
      return;
    }

    this.cancelarTimeoutAtivo();
    this.alterarEstadoAberto(false);
  }

  private onMouseOverToggleProduto = (): void => {
    if (this.isDispositivoMovel) {
      return;
    }

    this.cancelarTimeoutAtivo();
  }

  private onToggleAberto = (): void => {
    this.cancelarTimeoutAtivo();

    if (!this.exibirProdutos) {
      return;
    }

    if (this.isDispositivoMovel && this.isDropdownProdutosAberto) {
      return;
    }

    this.isDropdownProdutosAberto = !this.isDropdownProdutosAberto;
  }

  private onClickFechar = (event: UIEvent): void => {
    event.stopPropagation();
    event.preventDefault();

    this.isDropdownProdutosAberto = false;
  }

  private openLink = (event: UIEvent, url: string): void => {
    event.preventDefault();
    window.open(url, '_blank');
  }

  private getClassPorLinhaProduto = (product: Produto): string => {
    return product?.serviceLine?.abbreviation ?? '';
  }

  render() {
    const contemProdutos = this.produtos && this.produtos.length > 0;

    return (
      <section
        class={`marca-produto ${this.isDropdownProdutosAberto ? 'marca-produto--active' : ''}`}
        onClick={this.onToggleAberto}
        onMouseLeave={this.onMouseLeaveMenuProduto}
        onMouseOver={this.onMouseOverToggleProduto}
        aria-expanded={`${this.isDropdownProdutosAberto}`}
        aria-controls="marca_produto_detalhes">

        <header id="produto_description" title={this.produto}>{this.produto}</header>

        {this.exibirProdutos && (
          <div
            id="marca_produto_detalhes"
            class={`marca-produto__detalhes ${this.isDropdownProdutosAberto ? 'marca-produto__detalhes--show' : ''}`}
            onMouseOver={this.onMouseOverMenuProduto} onMouseLeave={this.onMouseLeaveMenuProduto}
            aria-hidden={`${!this.isDropdownProdutosAberto}`}
            aria-labelledby="produto_description"
            role="region">

            <div class="marca-produto__detalhes-solucoes">

              <div class="marca-produto__detalhes-solucoes__header">
                <h4>Mais produtos</h4>
                {contemProdutos && (<a href={this.getSuiteHome()} target="_blank" title="Ver todos" rel="noreferrer">Ver todos</a>)}

                {this.isDispositivoMovel && (
                  <button onClick={this.onClickFechar}>
                    <bth-icone icone="close"></bth-icone>
                  </button>
                )}
              </div>

              <div class="marca-produto__detalhes-solucoes__body">

                <div class={`loader-wrapper ${this.isBuscandoProdutos ? 'loader-wrapper--show' : ''}`}>
                  <bth-loader></bth-loader>
                </div>

                {!this.isBuscandoProdutos && !this.isApiIndisponivel && contemProdutos && (
                  <ul class="marca-produto__detalhes-solucoes__list">
                    {this.produtos && this.produtos.map((produto, index) => {
                      return (
                        <li key={index} id={`marca_produto_item_${produto.id}`}>
                          <button
                            class="marca-produto__detalhes-card marca-produto__detalhes-card--bordered marca-produto__detalhes-card--clickable"
                            onClick={event => this.openLink(event, produto.url)}>

                            <div class="marca-produto__detalhes-card__body" >
                              <div class={`marca-produto__detalhes__brand ${this.getClassPorLinhaProduto(produto)}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 231.73 251.78">
                                  <defs></defs>
                                  <title>{produto.name}</title>
                                  <g data-name="Camada 2">
                                    <g data-name="Camada 1">
                                      <path class="cls-1" d="M182.83,119.72c3.06,1.55,4.76,2.35,6.4,3.25,4.64,2.57,9.47,4.88,13.85,7.84,16.93,11.42,23.41,27.41,20.69,47.56-4,29.37-21.21,48.42-46.92,60.86-17.92,8.66-37.1,12.31-56.87,12.43-37.93.22-75.86.07-113.8.05-1.88,0-3.77-.27-6.18-.46,2.13-12.49,4.15-24.59,6.26-36.67Q18.32,145.39,30.42,76.2c3.29-18.77,6.72-37.53,9.82-56.33.6-3.67,2-5.29,5.63-6.24a388,388,0,0,1,60.5-11C121,1.23,135.74.29,150.44,0a106,106,0,0,1,39.06,6.7c9.61,3.57,18.4,8.49,25.75,15.74,20.84,20.56,22.11,55.65,2.68,76.07-7.27,7.64-16.21,12.89-25.83,17C189.47,116.71,186.93,117.9,182.83,119.72ZM62.14,210.82c2.25.24,3.66.52,5.07.52,19.32,0,38.65.23,58-.12a57.2,57.2,0,0,0,16.3-2.92c18.25-5.94,28.91-23.37,26.44-42.41-1.45-11.13-7.89-18.63-18.88-21.18A67,67,0,0,0,134.69,143c-17.87-.2-35.75-.1-53.62-.06-2.1,0-4.19.3-6.76.5ZM92.14,43C88.81,54.18,82,97.74,82.75,103.3a16.68,16.68,0,0,0,2.71.46c17.16,0,34.33.38,51.48-.08,11.23-.3,21-4.77,29.08-12.91,9-9.13,11.51-19.84,8-32-3.34-11.61-12.07-17-23.25-19.13-19.91-3.74-39.34.53-58.66,3.32Z" />
                                    </g>
                                  </g>
                                </svg>
                              </div>

                              <div class="marca-produto__detalhes__name block-text--hidden" title={produto.name}>{produto.name}</div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {!this.isBuscandoProdutos && !contemProdutos && (
                  <div class="empty-state-container">

                    {/* Empty state para lista vazia, sem resultados */}
                    {!this.isApiIndisponivel && ([
                      <div class="empty-list-store"></div>,
                      <h3>
                        Conheça outros produtos disponíveis.
                        Acesse os <a href={`${this.getStoreHome()}/#/pesquisa?identificador=TIPO&coluna=plataforma.chave&valor=web`} target="_blank" rel="noreferrer"> sistemas da entidade</a> ou
                        <a href={`${this.getStoreHome()}/#/pesquisa?identificador=TIPO&coluna=plataforma.chave&valor=web`} target="_blank" rel="noreferrer"> explore mais soluções na Betha Store <bth-icone icone="open-in-new"></bth-icone>
                        </a>
                      </h3>
                    ])}

                    {/* Empty state para quando ocorrer erro ao buscar produtos */}
                    {this.isApiIndisponivel && ([
                      <div class="empty-inconsistency"></div>,
                      <h3>A seleção de produtos está temporariamente indisponível</h3>
                    ])}
                  </div>
                )}

              </div>

            </div>
          </div>
        )
        }
      </section>
    );
  }
}

