import { Component, Listen, Element, Host, Prop, h, State, Method, ComponentInterface } from '@stencil/core';

import { isDispositivoMovel } from '../../../utils/functions';
import { PainelLateralShowEvent } from '../menu-painel-lateral/menu-painel-lateral.interfaces';
import { SLOT } from './menu-ferramenta.constants';

/**
 * Facilita a criação de Ferramentas para o menu. Abstrai comportamentos responsivos e controle do painel lateral.
 *
 * @slot menu_item_mobile - Item do menu para versão mobile
 * @slot menu_descricao_mobile - Descrição para versão mobile
 * @slot menu_item_desktop - Item do menu para versão desktop
 * @slot conteudo_painel_lateral - Conteúdo do painel lateral
 */
@Component({
  tag: 'bth-menu-ferramenta',
  styleUrl: 'menu-ferramenta.scss',
  shadow: true
})
export class MenuFerramenta implements ComponentInterface {

  @Element() el!: HTMLBthMenuFerramentaElement;

  @State() isDispositivoMovel: boolean = false;
  @State() possuiConteudoPainelLateralDeclarado: boolean = false;
  @State() possuiMenuItemDesktopDeclarado: boolean = false;
  @State() possuiMenuItemMobileDeclarado: boolean = false;

  /**
   * Descrição
   */
  @Prop() readonly descricao: string = '';

  /**
   * Título do Painel Lateral
   */
  @Prop() readonly tituloPainelLateral: string;

  connectedCallback() {
    this.configurarPropriedadesResponsivas();
  }

  @Listen('resize', { target: 'window' })
  onWindowResize(): void {
    this.configurarPropriedadesResponsivas();
  }

  /**
   * Fecha os paineis abertos
   */
  @Method()
  async fecharPaineisAbertos() {
    const painelLateral: HTMLBthMenuPainelLateralElement = this.el.shadowRoot.querySelector('bth-menu-painel-lateral');

    if (painelLateral === null) {
      return;
    }

    painelLateral.fecharPaineisAbertos();
  }

  private configurarPropriedadesResponsivas(): void {
    this.isDispositivoMovel = isDispositivoMovel();

    this.possuiConteudoPainelLateralDeclarado = this.el.querySelector(`[slot="${SLOT.CONTEUDO_PAINEL_LATERAL}"]`) !== null;
    this.possuiMenuItemDesktopDeclarado = this.el.querySelector(`[slot="${SLOT.MENU_ITEM_DESKTOP}"]`) !== null;
    this.possuiMenuItemMobileDeclarado = this.el.querySelector(`[slot="${SLOT.MENU_ITEM_MOBILE}"]`) !== null;
  }

  private alternarExibicaoPainelLateral() {
    const painelLateral: HTMLBthMenuPainelLateralElement = this.el.shadowRoot.querySelector('bth-menu-painel-lateral');

    if (painelLateral === null) {
      return;
    }

    painelLateral.show = !painelLateral.show;
  }

  private onToggleEstadoAberto = (event: UIEvent) => {
    event.preventDefault();
    this.alternarExibicaoPainelLateral();
  }

  private onPainelLateralShow = (event: CustomEvent<PainelLateralShowEvent>) => {
    if (this.isDispositivoMovel) {
      return;
    }

    const desktopToggler = this.el.shadowRoot.querySelector('.ferramenta-menu__desktop-toggler');

    if (desktopToggler === null) {
      return;
    }

    if (event.detail.show) {
      desktopToggler.classList.add('ferramenta-menu__desktop-toggler--active');
    } else {
      desktopToggler.classList.remove('ferramenta-menu__desktop-toggler--active');
    }
  }

  private onMouseOverToggle = (): void => {
    const painelLateral: HTMLBthMenuPainelLateralElement = this.el.shadowRoot.querySelector('bth-menu-painel-lateral');
    painelLateral.cancelarAberturaComAnimacao();
  }

  private onMouseLeaveToggle = (): void => {
    const painelLateral: HTMLBthMenuPainelLateralElement = this.el.shadowRoot.querySelector('bth-menu-painel-lateral');
    painelLateral.setShowComAnimacao(false);
  }

  render() {
    if (!this.possuiConteudoPainelLateralDeclarado) {
      return (
        <Host>
          <div class="ferramenta-menu__desktop-toggler" title={this.descricao} aria-haspopup="false">
            <slot name={SLOT.MENU_ITEM_DESKTOP}></slot>
          </div>
        </Host>
      );
    }

    return (
      <Host>
        {this.isDispositivoMovel && this.possuiMenuItemMobileDeclarado && (
          <div class="ferramenta-menu__mobile-toggler" title={this.descricao} aria-haspopup="true">
            <a href="" onClick={this.onToggleEstadoAberto} aria-label={`Acessar o painel da ferramenta de ${this.descricao}`} >
              <slot name={SLOT.MENU_ITEM_MOBILE}></slot>
              <slot name={SLOT.MENU_DESCRICAO_MOBILE}></slot>
            </a>
          </div>
        )}

        {!this.isDispositivoMovel && this.possuiMenuItemDesktopDeclarado && (
          <div class="ferramenta-menu__desktop-toggler" title={this.descricao} aria-haspopup="true">
            <a
              href=""
              onClick={this.onToggleEstadoAberto}
              onMouseLeave={this.onMouseLeaveToggle}
              onMouseOver={this.onMouseOverToggle}
              aria-label={`Acessar o painel da ferramenta de ${this.descricao}`}>
              <slot name={SLOT.MENU_ITEM_DESKTOP}></slot>
            </a>
          </div>
        )}

        <bth-menu-painel-lateral onPainelLateralShow={this.onPainelLateralShow} titulo={this.tituloPainelLateral}>
          <slot name={SLOT.CONTEUDO_PAINEL_LATERAL}></slot>
        </bth-menu-painel-lateral>
      </Host>
    );
  }

}
