import { Component, ComponentInterface, h, Prop } from '@stencil/core';

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

  render() {
    return (
      <div class={this.mobile ? 'mobile' : 'desktop'}>
        <bth-icone icone={this.icone}></bth-icone>
        <Badge contador={this.contador}></Badge>
      </div>
    );
  }
}
