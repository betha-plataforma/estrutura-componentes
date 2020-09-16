import { Component, h, Element, State, Prop, Event, EventEmitter, Listen, Watch, Method, ComponentInterface, Host } from '@stencil/core';

import { TIMEOUT_INTERACOES } from '../../../global/constants';
import { isDispositivoMovel } from '../../../utils/functions';
import { MenuBannerAlteradoEvent } from '../app.interfaces';
import { PainelLateralShowEvent } from './menu-painel-lateral.interfaces';

let idHandler = 0;

/**
 * Possibilita incluir conteúdo dinâmico em um painel lateral que sobrepõe o conteúdo da tela pela direita
 *
 * @slot - Conteúdo do painel lateral
 */
@Component({
  tag: 'bth-menu-painel-lateral',
  styleUrl: 'menu-painel-lateral.scss',
  shadow: true
})
export class MenuPainelLateral implements ComponentInterface {

  private timeoutAtivoHandler: number;

  @Element() el!: HTMLBthMenuPainelLateralElement;

  @State() isDispositivoMovel: boolean = false;
  @State() menuPossuiBanner: boolean = false;

  // É utilizado para manter o <slot /> no DOM enquanto a animação do painel estiver ativa
  @State() renderSlot: boolean = false;

  @State() uniqueId: string;

  /**
   * Estado de visibilidade
   */
  @Prop({ mutable: true, reflect: true }) show: boolean = false;

  /**
   * Título que será exibido no cabeçalho
   */
  @Prop() readonly titulo: string;

  @Watch('show')
  showHandler(): void {
    this.painelLateralShow.emit({ show: this.show, origemId: this.uniqueId });
  }

  /**
   * É toda vez em que o estado de exibição ("show") for alterado
   */
  @Event() painelLateralShow: EventEmitter<PainelLateralShowEvent>;

  connectedCallback() {
    this.uniqueId = `painel_lateral_${idHandler++}`;
    this.configurarPropriedadesResponsivas();
    this.watchShow(this.show);
  }

  @Listen('resize', { target: 'window' })
  onWindowResize(): void {
    this.configurarPropriedadesResponsivas();
    this.setShowComAnimacao(false);
  }

  @Listen('bannerAlterado', { target: 'window' })
  onBannerAlterado(event: CustomEvent<MenuBannerAlteradoEvent>): void {
    this.menuPossuiBanner = event.detail.possui;
  }

  @Listen('painelLateralShow', { target: 'window' })
  onPainelLateralShow(event: CustomEvent<PainelLateralShowEvent>): void {
    // Fecha o painel atual caso receba evento de outro painel lateral abrindo
    if (event.detail.show && this.uniqueId !== event.detail.origemId) {
      this.show = false;
    }
  }

  /**
   * Alterna o estado em aberto do painel para o valor do parâmetro após um timeout padrão de interações
   */
  @Method()
  async setShowComAnimacao(show: boolean) {
    this.timeoutAtivoHandler = window.setTimeout(() => {
      this.show = show;
      this.timeoutAtivoHandler = undefined;
    }, TIMEOUT_INTERACOES);
  }

  /**
   * Cancela o timeout de interação ativo caso exista
   */
  @Method()
  async cancelarAberturaComAnimacao() {
    if (this.timeoutAtivoHandler === undefined) {
      return;
    }

    clearTimeout(this.timeoutAtivoHandler);
    this.timeoutAtivoHandler = undefined;
  }

  /**
   * Fecha o painel lateral e emite evento para que outros sobrepostos sejam fechados.
   */
  @Method()
  async fecharPaineisAbertos() {
    this.dispatchFecharTodosEvent();

    this.show = false;
  }

  @Watch('show')
  watchShow(novoValor: boolean) {
    if (novoValor) {
      this.renderSlot = this.show;
    } else {
      setTimeout(() => this.renderSlot = this.show, TIMEOUT_INTERACOES);
    }
  }

  private dispatchFecharTodosEvent() {
    this.painelLateralShow.emit({
      show: false,
      fecharSobrepostos: true,
      origemId: this.uniqueId,
    });
  }

  private configurarPropriedadesResponsivas(): void {
    this.isDispositivoMovel = isDispositivoMovel();
  }

  private onToggleShow = (event: UIEvent) => {
    event.stopPropagation();

    this.show = !this.show;
  }

  private onCloseAll = (event: UIEvent) => {
    event.stopPropagation();

    this.dispatchFecharTodosEvent();

    this.show = !this.show;
  }

  private onMouseOver = (): void => {
    if (this.isDispositivoMovel) {
      return;
    }

    this.cancelarAberturaComAnimacao();
    this.setShowComAnimacao(true);
  }

  private onMouseLeave = (): void => {
    if (this.isDispositivoMovel) {
      return;
    }

    this.cancelarAberturaComAnimacao();
    this.setShowComAnimacao(false);
  }

  render() {
    return (
      <Host aria-hidden={`${!this.show}`} aria-expanded={`${this.show}`} aria-label={`${this.titulo ?? 'Painel lateral'}`}>
        <div
          class={`painel-lateral ${this.menuPossuiBanner ? 'painel-lateral--banner' : ''} ${this.show ? 'painel-lateral--show' : ''}`}
          onMouseLeave={this.onMouseLeave}
          onMouseOver={this.onMouseOver}
          aria-hidden={`${!this.show}`}
          aria-expanded={`${this.show}`}>

          <header>
            <button class="btn-back" onClick={this.onToggleShow} title="Voltar">
              <bth-icone icone="arrow-left"></bth-icone>
            </button>
            {this.titulo && (<h3>{this.titulo}</h3>)}
            <button class="btn-close" onClick={this.onCloseAll} title="Fechar todos">
              <bth-icone icone="close"></bth-icone>
            </button>
          </header>

          {this.renderSlot && (<slot>Conteúdo painel lateral</slot>)}

        </div>
      </Host>
    );
  }
}
