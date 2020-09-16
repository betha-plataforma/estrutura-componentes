import { Component, Prop, h, ComponentInterface } from '@stencil/core';

/**
 * Loader padrão com efeitos de animações
 */
@Component({
  tag: 'bth-loader',
  styleUrl: 'loader.scss',
  shadow: true
})
export class Loader implements ComponentInterface {

  /**
   * Define se o loader é inline
   */
  @Prop() readonly inline: boolean = false;

  render() {
    return (
      <div class={`loader ${this.inline ? 'loader--inline' : ''}`}>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    );
  }
}
