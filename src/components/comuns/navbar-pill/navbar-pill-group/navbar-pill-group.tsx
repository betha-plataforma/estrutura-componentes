import { Component, h, Prop, ComponentInterface } from '@stencil/core';

@Component({
  tag: 'bth-navbar-pill-group',
  styleUrl: 'navbar-pill-group.scss',
  shadow: true,
})
export class NavbarPillGroup implements ComponentInterface {

  /**
   * Descrição
   */
  @Prop() readonly descricao: string;

  render() {
    return (
      <nav aria-label={`Navegação por filtros ${this.descricao?.toLowerCase()}`}>
        <div class="navbar-pill-group" role="menubar">
          <slot />
        </div>
      </nav>
    );
  }

}
