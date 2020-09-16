import { Component, h, Prop, EventEmitter, Event } from '@stencil/core';

import { MSG_SEM_PERMISSAO_RECURSO } from '../../../global/constants';
import { PERMISSAO_PADRAO } from '../app.constants';
import { IdentificadorOpcaoMenu } from '../app.interfaces';
import BadgeContador from '../badge-contador';
import { MenuHorizontalSelecionadoEvent } from './menu-horizontal-item.interfaces';

/**
 * Item que representa uma opção do menu para navegação horizontal
 */
@Component({
  tag: 'bth-menu-horizontal-item',
  styleUrl: 'menu-horizontal-item.scss',
  shadow: true,
})
export class MenuHorizontalItem {

  /**
   * Está ativo?
   */
  @Prop() readonly ativo: boolean;

  /**
   * Contador
   *
   * Exibe o valor inforamdo em um badge próximo ao menu
   */
  @Prop() readonly contador: number;

  /**
   * Descrição
   */
  @Prop() readonly descricao: string;

  /**
   * Identificador
   */
  @Prop() readonly identificador: IdentificadorOpcaoMenu;

  /**
   * Possui permissão?
   */
  @Prop() readonly possuiPermissao: boolean = PERMISSAO_PADRAO;

  /**
   * É emitido quando o menu é selecionado
   */
  @Event() menuHorizontalSelecionado: EventEmitter<MenuHorizontalSelecionadoEvent>;

  private onClick = (event: UIEvent) => {
    event.preventDefault();

    if (this.possuiPermissao === false) {
      return;
    }

    this.menuHorizontalSelecionado.emit({
      identificador: this.identificador
    });
  }

  render() {
    return (
      <div class={`menu-horizontal__item ${this.ativo ? 'menu-horizontal__item--active' : ''}`}>
        <a
          href=""
          class={`${!this.possuiPermissao ? 'menu-horizontal__item--disabled' : ''}`}
          title={`${!this.possuiPermissao ? MSG_SEM_PERMISSAO_RECURSO : this.descricao}`}
          onClick={this.onClick}
          aria-disabled={`${!this.possuiPermissao}`}
          aria-label={`Navegar para ${this.descricao}`}
          tabindex={this.possuiPermissao ? 0 : -1}>

          <span>{this.descricao}</span>
          <BadgeContador valor={this.contador}></BadgeContador>
        </a>
      </div>
    );
  }

}
