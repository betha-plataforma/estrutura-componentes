import { Component, h, Prop, Event, EventEmitter, ComponentInterface } from '@stencil/core';

import { MSG_SEM_PERMISSAO_RECURSO } from '../../../global/constants';
import { isNill } from '../../../utils/functions';
import { PERMISSAO_PADRAO } from '../app.constants';
import { IdentificadorOpcaoMenu, OpcaoMenu, OpcaoMenuInterna } from '../app.interfaces';
import BadgeContador from '../badge-contador';
import { MenuVerticalSelecionadoEvent } from './menu-vertical-item.interfaces';

/**
 * Item que representa uma opção do menu para navegação vertical
 */
@Component({
  tag: 'bth-menu-vertical-item',
  styleUrl: 'menu-vertical-item.scss',
  shadow: true,
})
export class MenuVerticalItem implements ComponentInterface {

  /**
   * Está ativo?
   */
  @Prop() readonly ativo: boolean;

  /**
   * Valor que será exibido em uma "badge" próximo ao menu
   */
  @Prop() readonly contador: number;

  /**
   * Indica se deve aparecer um badge no ícone.
   */
  @Prop() readonly possuiBadgeIcone: boolean;

  /**
   * Descrição
   */
  @Prop() readonly descricao: string;

  /**
   * Ícone conforme biblioteca `"Material Design Icons"`
   */
  @Prop() readonly icone: string;

  /**
   * Identificador
   */
  @Prop() readonly identificador: IdentificadorOpcaoMenu;

  /**
   * Identificador do menu agrupador "pai"
   */
  @Prop() readonly identificadorPai: IdentificadorOpcaoMenu;

  /**
   * O menu principal está recolhido?
   *
   * Este parâmetro influência no formato como alguns elementos são exibidos, ex: badge do contador.
   */
  @Prop() readonly menuLateralRecolhido: boolean;

  /**
   * Possui permissão?
   */
  @Prop() readonly possuiPermissao: boolean = PERMISSAO_PADRAO;

  /**
   * Está recolhido?
   */
  @Prop() readonly recolhido: boolean;

  /**
   * É um submenu?
   */
  @Prop() readonly submenu: boolean;

  /**
   * Possui submenus?
   */
  @Prop() readonly submenus?: Array<OpcaoMenu>;

  /**
   * É emitido quando o menu é selecionado
   */
  @Event() menuVerticalSelecionado: EventEmitter<MenuVerticalSelecionadoEvent>;

  private onClick = (event: CustomEvent | UIEvent) => {
    event.preventDefault();

    if (this.possuiPermissao === false) {
      return;
    }

    this.menuVerticalSelecionado.emit({
      identificador: this.identificador,
      identificadorPai: this.identificadorPai
    });
  }

  render() {
    const possuiSubmenus = !isNill(this.submenus) && this.submenus.length > 0;

    return (
      <div
        class={`
          menu-vertical__item
          ${this.ativo ? ' menu-vertical__item--active' : ''}
          ${possuiSubmenus ? ' menu-vertical__item--has-children' : ''}
          ${(this.recolhido || this.menuLateralRecolhido) ? ' menu-vertical__item--collapsed' : ''}
          ${this.submenu ? 'menu-vertical__submenu' : ''}
        `}>

        <a
          href=""
          onClick={this.onClick}
          class={`${!possuiSubmenus && !this.possuiPermissao ? 'menu-vertical__item--disabled' : ''}`}
          title={`${!this.possuiPermissao ? MSG_SEM_PERMISSAO_RECURSO : this.descricao}`}
          aria-haspopup={`${possuiSubmenus}`}
          aria-expanded={`${possuiSubmenus && !(this.recolhido || this.menuLateralRecolhido)}`}
          aria-disabled={`${!this.possuiPermissao}`}
          aria-label={possuiSubmenus ? `Expandir ${this.descricao}` : `Navegar para ${this.descricao}`}
          tabindex={this.possuiPermissao ? 0 : -1}>
          {this.icone && this.possuiBadgeIcone && (<bth-icone-badge><bth-icone slot="icone" icone={this.icone}></bth-icone></bth-icone-badge>) }
          {this.icone && !this.possuiBadgeIcone && (<bth-icone icone={this.icone}></bth-icone>)}

          <span
            class={`${isNill(this.icone) && !this.submenu ? 'menu-vertical__item--sem-icone' : ''}`}
            title={`${!this.possuiPermissao ? MSG_SEM_PERMISSAO_RECURSO : this.descricao}`}>
            {this.descricao}
          </span>

          <BadgeContador valor={this.contador} customClass={this.menuLateralRecolhido ? 'badge-vertical-floating' : ''}></BadgeContador>

          {possuiSubmenus && (<bth-icone icone="chevron-up"></bth-icone>)}
        </a>

        {possuiSubmenus && (
          <ul class="menu-vertical__list">
            {this.submenus.map((submenu: OpcaoMenuInterna, index: number) => {
              return (
                <li>
                  <bth-menu-vertical-item
                    id={`menu_vertical_subitem_${index}`}
                    key={index}
                    identificador={submenu.id}
                    identificador-pai={this.identificador}
                    descricao={submenu.descricao}
                    icone={submenu.icone}
                    onMenuVerticalSelecionado={this.onClick}
                    contador={submenu.contador}
                    possuiPermissao={submenu.possuiPermissao ?? PERMISSAO_PADRAO}
                    ativo={submenu.isAtivo}
                    recolhido={submenu.isRecolhido}
                    menuLateralRecolhido={this.menuLateralRecolhido}
                    submenus={submenu.submenus}
                    submenu={true}>
                  </bth-menu-vertical-item>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

}
