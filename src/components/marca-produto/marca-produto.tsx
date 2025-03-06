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
  @State() abbreviation: string;

  /**
   * Nome do produto
   */
  @Prop() readonly produto!: string;

  /**
   * Define a área de produtos.
   */
  @Prop() readonly area?: string;

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

    this.abbreviation = this.area || 'GEN';

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
        this.abbreviation = this.area || produtos.find((produto: Produto) => produto.id === authorization.systemId)?.serviceLine?.abbreviation;
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
        class={`marca-produto ${this.abbreviation} ${this.isDropdownProdutosAberto ? 'marca-produto--active' : ''}`}
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
                            class="bth__card bth__card--clickable"
                            onClick={event => this.openLink(event, produto.url)}>
                            <div class={`bth__brand ${this.getClassPorLinhaProduto(produto)}`}></div>
                            <span class="descricao descricao--produto twoline-ellipsis" title={produto.name}>{produto.name}</span>
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
                        Acesse os <a href={this.getSuiteHome()} target="_blank" rel="noreferrer">sistemas da entidade</a> ou
                        <a href={`${this.getStoreHome()}/pesquisa?identificador=TIPO&coluna=plataforma.chave&valor=web`} target="_blank" rel="noreferrer"> explore mais soluções na Betha Store <bth-icone icone="open-in-new"></bth-icone>
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

