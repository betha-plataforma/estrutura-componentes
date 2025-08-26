import { Host, Component, Element, State, Listen, Method, Prop, h, Event, EventEmitter, Watch, ComponentInterface, } from '@stencil/core';

import { TIMEOUT_INTERACOES, MSG_SEM_PERMISSAO_RECURSO, } from '../../global/constants';
import { isNill, isDispositivoMovel } from '../../utils/functions';
import { SLOT, LOCAL_STORAGE_KEY } from './app.constants';
import { OpcaoMenu, LocalStorageState, IdentificadorOpcaoMenu, Banner, MenuBannerAlteradoEvent, OpcaoMenuSelecionadaEvent, OpcaoMenuInterna, ConteudoSinalizadoEvent } from './app.interfaces';
import { MenuHorizontalSelecionadoEvent } from './menu-horizontal-item/menu-horizontal-item.interfaces';
import { PainelLateralShowEvent } from './menu-painel-lateral/menu-painel-lateral.interfaces';
import { MenuVerticalSelecionadoEvent } from './menu-vertical-item/menu-vertical-item.interfaces';

/**
 * Permite configurar opções de navegação nos modelos de menu horizontal e vertical.
 * Possui áreas pré-definidas que permite compor as aplicações.
 *
 * @slot menu_marca_produto - Área da marca e produto, precede o menu horizontal e geralmente contém a logo e nome do produto
 * @slot menu_ferramentas - Área de ferramentas, fica na lateral direita do menu horizontal e geralmente comporta extensões da plataforma
 * @slot container_contexto - Área do contexto logo abaixo do menu horizontal, permite compor componentes como a barra de contexto, ja pré estiliza <ul>
 * @slot container_aplicacao - Área servindo como container para aplicação
 */
@Component({
  tag: 'bth-app',
  styleUrl: 'app.scss',
  shadow: true
})
export class App implements ComponentInterface {

  private timeoutAtivoHandler: number;
  private ferramentasSinalizacaoPendente: Record<string, boolean> = {};

  @Element() el!: HTMLBthAppElement;

  @State() isMenuVerticalRecolhido: boolean;
  @State() isMenuVerticalFlutuando: boolean = false;
  @State() isMenuVerticalAberto: boolean = true;

  @State() isDispositivoMovel: boolean = false;

  @State() isPainelFerramentasDispositivoMovelAberto: boolean = false;
  @State() opcoesMenu?: Array<OpcaoMenuInterna>;
  @State() opcoesHeaderInternas?: Array<OpcaoMenuInterna> = [];

  @State() possuiSinalizacaoPendente: boolean = false;

  /**
   * Opções de navegação do menu
   */
  @Prop() readonly opcoes?: Array<OpcaoMenu> = [];

  /**
   * Opções de navegação a serem exibidas no header, ao lado da marca.
   * Funciona de forma independente da navegação principal, e somente se o menu for vertical.
   */
  @Prop() readonly opcoesHeader?: Array<OpcaoMenu> = [];

  /**
   * Define se as opções do menu serão exibidas no formato "vertical", caso contrário serão exibidas no formato "horizontal"
   */
  @Prop() readonly menuVertical?: boolean = false;

  /**
   * Permite customizar a cor de fundo da barra do menu. Por padrão segue a cor da linha dos produtos.
   */
  @Prop() readonly menuBgColor: string;

  /**
   * Permite definir um banner que é exibido acima do menu
   */
  @Prop() readonly banner?: Banner;

  /**
   * É emitido quando o componente de menu possuir alterações na propriedade de banner
   */
  @Event() bannerAlterado: EventEmitter<MenuBannerAlteradoEvent>;

  /**
   * É emitido quando alguma opção do menu for selecionada
   */
  @Event() opcaoMenuSelecionada: EventEmitter<OpcaoMenuSelecionadaEvent>;

  /**
   * É emitido quando o botão do banner é clicado
   */
  @Event() botaoBannerAcionado: EventEmitter<void>;

  connectedCallback() {
    this.setCorBackgroundCustomizado();
    this.setEstadoInicialMenu();
  }

  @Watch('opcoes')
  @Watch('opcoesHeader')
  watchOpcoesChanged() {
    // Reseta estado inicial do menu toda vez que opções for alterado, evita reabertura de maneira inconsistente
    this.setEstadoInicialMenu();
  }

  @Listen('resize', { target: 'window' })
  onWindowResize(): void {
    this.setEstadoInicialMenu();

    if (!this.isDispositivoMovel) {
      this.isPainelFerramentasDispositivoMovelAberto = false;
    }
  }

  @Listen('conteudoSinalizado')
  onConteudoSinalizado(event: CustomEvent<ConteudoSinalizadoEvent>): void {
    this.ferramentasSinalizacaoPendente[event.detail.origem] = event.detail.possui;
    this.possuiSinalizacaoPendente = this.possuiFerramentasSinalizadas();
  }

  @Listen('painelLateralShow')
  onPainelLateralShow(event: CustomEvent<PainelLateralShowEvent>): void {
    if (!this.isPainelFerramentasDispositivoMovelAberto) {
      return;
    }

    if (event.detail.fecharSobrepostos) {
      this.isPainelFerramentasDispositivoMovelAberto = false;
    }
  }

  @Listen('menuHorizontalSelecionado')
  onMenuHorizontalSelecionado(event: CustomEvent<MenuHorizontalSelecionadoEvent>) {
    const identificador = event.detail.identificador;
    let opcao: OpcaoMenuInterna;

    if (this.menuVertical) {
      opcao = this.opcoesHeaderInternas.find(opt => opt.id === identificador);
    } else {
      opcao = this.findOpcaoMenuById(identificador);
    }

    this.dispararEventoOpcaoSelecionada(opcao);
  }

  @Listen('menuVerticalSelecionado')
  onMenuVerticalSelecionado(event: CustomEvent<MenuVerticalSelecionadoEvent>): void {
    const opcao = this.findOpcaoMenuById(event.detail.identificador, event.detail.identificadorPai);

    if (this.possuiSubmenus(opcao)) {
      this.opcoesMenu = this.opcoesMenu.map(opcaoMenu => {
        if (opcao.id === opcaoMenu.id) {
          opcaoMenu.isRecolhido = !opcaoMenu.isRecolhido;
        }

        return opcaoMenu;
      });
    } else {
      if (this.isDispositivoMovel) {
        this.isMenuVerticalRecolhido = !this.isMenuVerticalRecolhido;
      }

      this.dispararEventoOpcaoSelecionada(opcao);
    }
  }

  private dispararEventoOpcaoSelecionada(opcao: OpcaoMenuInterna) {
    const eventPayload: OpcaoMenuSelecionadaEvent = {
      id: opcao.id,
      descricao: opcao.descricao,
      rota: opcao.rota,
      contador: opcao.contador
    };

    this.opcaoMenuSelecionada.emit(eventPayload);
  }

  @Watch('banner')
  onChangeBanner() {
    let event: MenuBannerAlteradoEvent = {
      possui: this.possuiBanner()
    };

    this.bannerAlterado.emit(event);
  }

  @Watch('menuBgColor')
  onChangemenuBgColor() {
    this.setCorBackgroundCustomizado();
  }

  /**
   * Define o estado de ativo para o menu do parâmetro
   *
   * @param identificador Identificador do menu
   */
  @Method()
  async setMenuAtivo(identificador: IdentificadorOpcaoMenu) {
    const isHeader = this.opcoesHeader.some(opt => opt.id === identificador);

    if (isHeader) {
      this.marcarAtivoMenuHeader(identificador);
    } else {
      if (this.possuiNavegacaoVertical()) {
        this.marcarAtivoMenuVertical(identificador);
      }
      if (this.possuiNavegacaoHorizontal()) {
        this.marcarAtivoMenuHorizontal(identificador);
      }
    }
  }

  /**
   * Define o estado de ativo para o badge no icone do item do menu
   *
   * @param identificador Identificador do menu
   * @param ativo boolean que indica se deve ou não mostrar
   */
  @Method()
  async setBadgeIcone(identificador: IdentificadorOpcaoMenu, ativo: boolean) {
    if (this.possuiNavegacaoVertical()) {
      this.opcoesMenu = this.opcoesMenu.map(opcao => {
        opcao.possuiBadgeIcone = opcao.id === identificador ? ativo : false;
        if (opcao.submenus !== undefined && opcao.submenus.length > 0) {
          opcao.submenus = opcao.submenus.map(submenu => {
            submenu.possuiBadgeIcone = submenu.id === identificador ? ativo : false;
            return submenu;
          });
        }
        return opcao;
      });
    }}

  /**
   * Define o valor do contador de um item do menu
   *
   * @param identificador Identificador do item do menu
   * @param valor Valor do contador
   */
  @Method()
  async setContadorMenu(identificador: IdentificadorOpcaoMenu, valor: number) {
    if (this.possuiNavegacaoVertical()) {
      this.opcoesMenu = this.opcoesMenu.map(opcao => {
        opcao.contador = opcao.id === identificador ? valor : opcao.contador;

        if (opcao.submenus !== undefined && opcao.submenus.length > 0) {
          opcao.submenus = opcao.submenus.map(submenu => {
            submenu.contador = submenu.id === identificador ? valor : submenu.contador;
            return submenu;
          });
        }

        return opcao;
      });
    }
    if (this.possuiNavegacaoHorizontal()) {
      this.opcoesMenu = this.opcoesMenu.map(opcao => {
        opcao.contador = opcao.id === identificador ? valor : opcao.contador;
        return opcao;
      });
    }
  }

  private setCorBackgroundCustomizado(): void {
    if (this.menuBgColor === undefined) {
      return;
    }

    this.el.style.setProperty('--bth-app-menu-bg-color', this.menuBgColor.toString());
  }

  private possuiSlotMarcaProduto(): boolean {
    return this.el.querySelector(`[slot="${SLOT.MARCA_PRODUTO}"]`) !== null;
  }

  private possuiSlotFerramentas(): boolean {
    return this.el.querySelector(`[slot="${SLOT.FERRAMENTAS}"]`) !== null;
  }

  private possuiSlotContexto(): boolean {
    return this.el.querySelector(`[slot="${SLOT.CONTEXTO}"]`) !== null;
  }

  private possuiFerramentasSinalizadas(): boolean {
    const pending = Object.keys(this.ferramentasSinalizacaoPendente)
      .filter(key => this.ferramentasSinalizacaoPendente[key]);

    return pending.length > 0 || false;
  }

  private possuiOpcoes(): boolean {
    return !isNill(this.opcoesMenu) && this.opcoesMenu.length > 0;
  }

  private possuiOpcoesHeader(): boolean {
    return !isNill(this.opcoesHeaderInternas) && this.opcoesHeaderInternas.length > 0;
  }

  private possuiBanner(): boolean {
    return !isNill(this.banner);
  }

  private possuiNavegacaoVertical(): boolean {
    if (this.possuiOpcoes()) {
      return this.menuVertical || (!this.menuVertical && this.isDispositivoMovel);
    }

    return false;
  }

  private possuiNavegacaoHorizontal(): boolean {
    return this.possuiOpcoes() && !this.menuVertical;
  }

  private setEstadoInicialMenu(): void {
    // this.opcoesMenu = [...this.opcoes];
    this.opcoesMenu = this.validarOpcoes([...this.opcoes]);
    this.opcoesHeaderInternas = this.validarOpcoes([...this.opcoesHeader]);

    this.isDispositivoMovel = isDispositivoMovel();

    const estadoLocalStorage = this.recuperarEstadoLocalStorage();

    this.isPainelFerramentasDispositivoMovelAberto = false;
    this.isMenuVerticalFlutuando = estadoLocalStorage !== null ? estadoLocalStorage.flutuando : false;
    this.isMenuVerticalAberto = estadoLocalStorage !== null ? estadoLocalStorage.aberto : true;

    if (this.isMenuVerticalFlutuando) {
      this.isMenuVerticalRecolhido = true;
    } else {
      this.isMenuVerticalRecolhido = !this.isMenuVerticalAberto;
    }

    if (this.isDispositivoMovel) {
      this.isPainelFerramentasDispositivoMovelAberto = false;
      this.isMenuVerticalFlutuando = true;
      this.isMenuVerticalAberto = false;
      this.isMenuVerticalRecolhido = true;
    }
  }

  private salvarEstadoLocalStorage = (): void => {
    try {
      const value: LocalStorageState = {
        aberto: this.isMenuVerticalAberto,
        flutuando: this.isMenuVerticalFlutuando
      };

      const valueStringfied: string = JSON.stringify(value);

      localStorage.setItem(LOCAL_STORAGE_KEY, valueStringfied);
    } catch (err) {
      console.error('Erro ao armazenar preferencia de menu do usuario', err);
    }
  };

  private recuperarEstadoLocalStorage = (): LocalStorageState => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (stored === null) {
        return null;
      }

      return JSON.parse(stored);
    } catch (err) {
      console.error('Erro ao armazenar preferencia de menu do usuario', err);
    }
  };

  private marcarAtivoMenuVertical(id: IdentificadorOpcaoMenu): void {
    this.opcoesMenu = this.opcoesMenu.map(opcao => {
      opcao.isAtivo = opcao.id === id;

      if (opcao.isAtivo) {
        this.validarPermissaoAcessarOpcaoMenu(opcao);
      }

      if (this.possuiSubmenus(opcao)) {
        opcao.submenus = opcao.submenus.map(submenu => {
          submenu.isAtivo = submenu.id === id;

          if (submenu.isAtivo) {
            this.validarPermissaoAcessarOpcaoMenu(submenu);
          }

          if (submenu.isAtivo) {
            opcao.isAtivo = true;
          }

          return submenu;
        });

        opcao.isRecolhido = opcao.submenus.filter(submenu => submenu.isAtivo).length <= 0;
      }

      return opcao;
    });
  }

  private marcarAtivoMenuHorizontal(id: IdentificadorOpcaoMenu): void {
    this.opcoesMenu = this.opcoesMenu.map(opcao => {
      opcao.isAtivo = opcao.id === id;

      if (opcao.isAtivo) {
        this.validarPermissaoAcessarOpcaoMenu(opcao);
      }

      return opcao;
    });
  }

  private marcarAtivoMenuHeader(id: IdentificadorOpcaoMenu): void {
    this.opcoesHeaderInternas = this.opcoesHeaderInternas.map(opcao => {
      opcao.isAtivo = opcao.id === id;

      if (opcao.isAtivo) {
        this.validarPermissaoAcessarOpcaoMenu(opcao);
      }

      return opcao;
    });
  }

  private findOpcaoMenuById(identificador: IdentificadorOpcaoMenu, identificadorPai: IdentificadorOpcaoMenu = null) {
    if (!isNill(identificadorPai)) {
      const menuPai = this.opcoesMenu.find(opcaoMenu => opcaoMenu.id === identificadorPai);

      if (!isNill(menuPai)) {
        return menuPai.submenus.find(submenu => submenu.id === identificador);
      }
    }

    return this.opcoesMenu.find(opcaoMenu => opcaoMenu.id === identificador);
  }

  private possuiSubmenus(opcao: OpcaoMenuInterna) {
    return !isNill(opcao.submenus) && opcao.submenus.length > 0;
  }

  private validarPermissaoAcessarOpcaoMenu(opcao: OpcaoMenuInterna) {
    if ('possuiPermissao' in opcao && !opcao.possuiPermissao) {
      throw new Error(MSG_SEM_PERMISSAO_RECURSO);
    }
  }

  private cancelarTimeoutRecolhimentoMenu(): void {
    if (this.timeoutAtivoHandler !== undefined) {
      clearTimeout(this.timeoutAtivoHandler);
      this.timeoutAtivoHandler = undefined;
    }
  }

  private alterarEstadoRecolhimentoMenuVertical(isMenuVerticalRecolhido: boolean): void {
    this.timeoutAtivoHandler = window.setTimeout(() => {
      this.isMenuVerticalRecolhido = isMenuVerticalRecolhido;
      this.timeoutAtivoHandler = undefined;
    }, TIMEOUT_INTERACOES);
  }

  /**
   * Valida se no máximo um item está ativo e processa o array para o estado interno.
   * Se múltiplos itens forem passados como 'ativo', TODOS serão desativados como medida de segurança,
   * e um alerta será exibido no console.
   * @param opcoes O array de opções de menu a ser processado.
   * @returns Um novo array de opções com no máximo um item ativo.
   */
  private validarOpcoes(opcoes: OpcaoMenu[]): OpcaoMenuInterna[] {
    if (!opcoes || opcoes.length === 0) {
      return [];
    }

    if (opcoes.filter(opt => opt.isAtivo === true).length > 1) {
      console.warn('[bth-app] Múltiplos itens de menu recebidos como \'ativo\'. Nenhum item foi selecionado.');
      return opcoes.map(opt => ({ ...opt, isAtivo: false }));

    }
    return opcoes;
  }

  private onMouseOverMenuVertical = (): void => {
    this.cancelarTimeoutRecolhimentoMenu();

    if (this.isDispositivoMovel) {
      return;
    }

    if (this.isMenuVerticalAberto) {
      return;
    }

    this.alterarEstadoRecolhimentoMenuVertical(false);
  };

  private onMouseLeaveMenuVertical = (): void => {
    if (this.isDispositivoMovel) {
      return;
    }

    if (this.isMenuVerticalAberto && !this.isMenuVerticalFlutuando) {
      return;
    }

    this.cancelarTimeoutRecolhimentoMenu();
    this.alterarEstadoRecolhimentoMenuVertical(true);
  };

  private onMouseOverBotaoMenu = (): void => {
    this.cancelarTimeoutRecolhimentoMenu();
  };

  private onMouseLeaveBotaoMenu = (): void => {
    if (this.isMenuVerticalRecolhido) {
      return;
    }

    if (this.isMenuVerticalAberto && !this.isMenuVerticalFlutuando) {
      return;
    }

    this.cancelarTimeoutRecolhimentoMenu();
    this.alterarEstadoRecolhimentoMenuVertical(true);
  };

  private onTogglePainelFerramentas = (event: UIEvent): void => {
    event.preventDefault();

    this.isPainelFerramentasDispositivoMovelAberto = !this.isPainelFerramentasDispositivoMovelAberto;

    if (this.isDispositivoMovel && this.isPainelFerramentasDispositivoMovelAberto) {
      this.isMenuVerticalAberto = false;
    }

    this.salvarEstadoLocalStorage();
  };

  private onClickBotaoFixar = (event: UIEvent): void => {
    event.preventDefault();
    this.isMenuVerticalFlutuando = !this.isMenuVerticalFlutuando;
    this.isMenuVerticalRecolhido = false;
    this.isMenuVerticalAberto = true;
    this.salvarEstadoLocalStorage();
  };

  private onClickBotaoMenu = (event: UIEvent): void => {
    event.preventDefault();

    if (this.isMenuVerticalFlutuando) {
      this.isMenuVerticalRecolhido = !this.isMenuVerticalRecolhido;
    } else {

      if (!this.isMenuVerticalRecolhido) {
        this.isMenuVerticalAberto = false;
      } else {
        this.isMenuVerticalAberto = !this.isMenuVerticalAberto;
      }

      this.isMenuVerticalRecolhido = !this.isMenuVerticalRecolhido;
    }

    // Caso o menu vertical for aberto no modo responsivo fecha o painel de ferramentas
    if (this.isDispositivoMovel && this.isMenuVerticalFlutuando) {
      this.isPainelFerramentasDispositivoMovelAberto = false;
    }

    this.salvarEstadoLocalStorage();
  };

  private onClickBotaoBanner = (event: CustomEvent | UIEvent) => {
    event.preventDefault();

    this.botaoBannerAcionado.emit();
  }

  private renderBannerSection() {
    return (
      <header
        role="banner"
        class={`banner ${this.possuiBanner() ? ` banner--show banner--${this.banner.tipo}` : ''}`}
        aria-hidden={`${!this.possuiBanner()}`}
        aria-expanded={`${this.possuiBanner()}`}>

        {this.possuiBanner() && ([
          <div class="banner__icon">
            <bth-icone icone={this.banner.icone ? this.banner.icone : this.banner.tipo === 'info' ? 'information' : 'alert'}></bth-icone>
          </div>,
          <div class="banner__content">
            <span>{this.banner.texto}</span>
            {!isNill(this.banner.link) && this.banner.link.trim() !== '' && (
              <a href={this.banner.link} target={this.banner.target} title="Mais informações" rel="noreferrer">
                {this.banner.labelLink ? this.banner.labelLink : 'Mais informações'}
              </a>
            )}
            {!isNill(this.banner.button) && (
              <button onClick={this.onClickBotaoBanner}>{this.banner.button.textButton}</button>
            )}
          </div>
        ])}
      </header>
    );
  }

  private renderMenuHorizontal() {
    return (
      <section class="menu-horizontal">
        <div class="menu-horizontal__body">
          <div class="menu-horizontal__list">

            {this.possuiNavegacaoVertical() && (
              <div class="menu-horizontal__item">
                <a
                  role="button"
                  href=""
                  class={`menu-vertical__toggle ${!this.isMenuVerticalRecolhido ? 'menu-vertical__toggle--opened' : ''}`}
                  title="Alternar exibição do menu lateral"
                  onClick={this.onClickBotaoMenu}
                  onMouseLeave={this.onMouseLeaveBotaoMenu}
                  onMouseOver={this.onMouseOverBotaoMenu}
                  aria-expanded={`${!this.isMenuVerticalRecolhido}`}
                  aria-pressed={`${!this.isMenuVerticalRecolhido}`}
                  aria-label="Alternar exibição do menu lateral">
                </a>
              </div>
            )}

            {this.possuiSlotMarcaProduto() && (
              <section class="menu-horizontal__item">
                <slot name={SLOT.MARCA_PRODUTO} />
              </section>
            )}

            {/* Navegação Adicional do Header */}
            <nav
              id="menu_header"
              class="menu-horizontal__item menu-horizontal__item--has-list"
              aria-label="Navegação do header"
              aria-hidden={`${!this.possuiOpcoesHeader() || !this.menuVertical}`}>

              {this.possuiOpcoesHeader() && this.menuVertical && (
                <ul role="menubar" class="menu-horizontal__list" aria-label="Navegação do header">
                  {this.opcoesHeaderInternas.map((opcao, index) => (
                    <li role="none" key={`header_${index}`}>
                      <bth-menu-horizontal-item
                        role="menuitem"
                        id={`menu_header_item_${index}`}
                        identificador={opcao.id}
                        descricao={opcao.descricao}
                        contador={opcao.contador}
                        possuiPermissao={opcao.possuiPermissao}
                        ativo={opcao.isAtivo}>
                      </bth-menu-horizontal-item>
                    </li>
                  ))}
                </ul>
              )}
            </nav>

            {/* Navegação Menu Horizontal */}
            <nav
              id="menu_horizontal_list"
              class="menu-horizontal__item menu-horizontal__item--has-list"
              aria-label="Navegação do menu horizontal"
              aria-hidden={`${!this.possuiNavegacaoHorizontal()}`}>

              {this.possuiNavegacaoHorizontal() && (
                <ul role="menubar" class="menu-horizontal__list" aria-label="Navegação do menu horizontal">
                  {this.possuiNavegacaoHorizontal() && this.opcoesMenu.map((opcao, index) => (
                    <li role="none">
                      <bth-menu-horizontal-item
                        role="menuitem"
                        id={`menu_horizontal_item_${index}`}
                        key={index}
                        identificador={opcao.id}
                        descricao={opcao.descricao}
                        contador={opcao.contador}
                        possuiPermissao={opcao.possuiPermissao}
                        ativo={opcao.isAtivo}>
                      </bth-menu-horizontal-item>
                    </li>
                  ))}
                </ul>
              )}
            </nav>

            <section class="menu-horizontal__item">
              <nav class="menu-ferramentas">
                {!this.isDispositivoMovel && (<slot name={SLOT.FERRAMENTAS} />)}

                {this.isDispositivoMovel && this.possuiSlotFerramentas() && (
                  <li role="none">
                    <a
                      role="button"
                      href=""
                      class={`menu-ferramentas__mobile-toggler ${this.isPainelFerramentasDispositivoMovelAberto ? 'menu-ferramentas__mobile-toggler--opened' : ''}`}
                      onClick={this.onTogglePainelFerramentas}
                      title="Alternar exibição painel de ferramentas"
                      aria-expanded={`${this.isPainelFerramentasDispositivoMovelAberto}`}
                      aria-pressed={`${this.isPainelFerramentasDispositivoMovelAberto}`}
                      aria-label="Alternar exibição painel de ferramentas">

                      {this.possuiSinalizacaoPendente && !this.isPainelFerramentasDispositivoMovelAberto && (
                        <span class="badge badge-danger badge-danger--notificacao-small"></span>
                      )}
                    </a>
                  </li>
                )}
              </nav>
            </section>
          </div>

          {this.isDispositivoMovel && (
            <nav
              class={`menu-ferramentas__mobile
                  ${this.isPainelFerramentasDispositivoMovelAberto ? 'menu-ferramentas__mobile--show' : ''}
                  ${this.possuiBanner() ? 'menu-ferramentas__mobile--banner' : ''}`
              }>
              <slot name={SLOT.FERRAMENTAS} />
            </nav>
          )}
        </div>
      </section >
    );
  }

  private renderMenuVertical() {
    if (!this.possuiNavegacaoVertical()) {
      return;
    }

    return (
      <aside
        class={`menu-vertical ${this.isMenuVerticalFlutuando ? ' menu-vertical--floating' : ''}
          ${this.isMenuVerticalRecolhido ? ' menu-vertical--collapsed' : ''}
          ${!this.isMenuVerticalFlutuando && !this.isMenuVerticalAberto && !this.isMenuVerticalRecolhido ? ' menu-vertical--collapsed menu-vertical--collapsed-hover' : ''}
        `}
        onMouseOver={this.onMouseOverMenuVertical}
        onMouseLeave={this.onMouseLeaveMenuVertical}>

        <nav class="menu-vertical__body" aria-label="Opções de navegação do menu vertical">
          <ul role="menubar" class="menu-vertical__list">
            {this.opcoesMenu.map((opcao, index) => (
              <li role="none">
                <bth-menu-vertical-item
                  role="menuitem"
                  id={`menu_vertical_item_${index}`}
                  key={index}
                  identificador={opcao.id}
                  descricao={opcao.descricao}
                  icone={opcao.icone}
                  contador={opcao.contador}
                  possuiPermissao={opcao.possuiPermissao}
                  possuiBadgeIcone={opcao.possuiBadgeIcone}
                  ativo={opcao.isAtivo}
                  recolhido={opcao.isRecolhido}
                  menuLateralRecolhido={this.isMenuVerticalRecolhido}
                  submenus={opcao.submenus}>
                </bth-menu-vertical-item>
              </li>
            ))}
          </ul>
        </nav>

        <div class={`menu-vertical__footer ${this.isDispositivoMovel ? '' : 'menu-vertical__footer--show'}`}>
          <ul class="menu-vertical__list">
            <li class="menu-vertical__item menu-vertical__item--floating">
              <a href="" onClick={this.onClickBotaoFixar}>
                <bth-icone icone="pin"></bth-icone>
                <span>{this.isMenuVerticalFlutuando ? 'Fixar' : 'Desafixar'}</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>
    );
  }

  private renderAppContainer() {
    return (
      <main class="app-container">
        {this.possuiSlotContexto() && !this.isDispositivoMovel && (<slot name={SLOT.CONTEXTO} />)}
        <slot name={SLOT.APLICACAO} />
      </main>
    );
  }

  render() {
    return (
      <Host>
        <div class="app">
          {this.renderBannerSection()}
          {this.renderMenuHorizontal()}
          {this.renderMenuVertical()}
          {this.renderAppContainer()}
        </div>
      </Host>
    );
  }
}
