import { Component, ComponentInterface, h, Prop } from '@stencil/core';

import { isNill } from '../../../utils/functions';
import Badge from './badge-menu-ferramenta-icone';

/**
 * Abstrai a estilização de um ícone para menu-ferramenta.
 * Também implementa a possibilidade de exibição de um `badge` ao lado do ícone, através da propriedade `contador`.
 */
@Component({
  tag: 'bth-menu-ferramenta-icone',
  styleUrl: 'menu-ferramenta-icone.scss',
  shadow: true
})
export class MenuFerramentaIcone implements ComponentInterface {

  /**
   * Valor que será exibido em uma "badge" próximo ao ícone
   */
  @Prop() readonly contador: number = 0;

  /**
   * Ícone conforme biblioteca `"Material Design Icons"`
   */
  @Prop() readonly icone: string = 'cloud';

  /**
   * Define se a estilização é "mobile". Por padrão é "desktop".
   */
  @Prop() readonly mobile: boolean = false;

  /**
   * Badge de Status
   */
  @Prop() readonly status: 'online' | 'offline' | undefined;

  render() {
    return (
      <div class={this.mobile ? 'mobile' : 'desktop'}>
        <bth-icone icone={this.icone}></bth-icone>
        { this.status == 'online' && (isNill(this.contador) || this.contador == 0) && (<span class="badge status status--success"></span>)}
        { this.status == 'offline' && (isNill(this.contador) || this.contador == 0) && (<span class="badge status status--danger"></span>)}
        { this.contador > 0 && (<Badge contador={this.contador}></Badge>)}
      </div>
    );
  }
}
