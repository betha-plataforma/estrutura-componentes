import { Component, h, Prop, ComponentInterface, Host, Watch } from '@stencil/core';

import { isNill } from '../../../utils/functions';

@Component({
  tag: 'bth-icone',
  styleUrl: 'icone.css',
  shadow: true
})
export class Icone implements ComponentInterface {

  /**
   * Identificador do ícone conforme biblioteca `"Material Design Icons"`
   */
  @Prop({ reflect: true }) readonly icone!: string;

  /**
   * Tamanho em pixels, no mesmo formato do `"font-size"` em CSS.
   * Por padrão irá herdar do contexto inserido.
   */
  @Prop({ reflect: true }) readonly tamanho: string = 'inherit';

  /**
   * Cor de preenchimento, no mesmo formato do `"color"` em CSS.
   * Por padrão irá herdar do contexto inserido.
   */
  @Prop({ reflect: true }) readonly cor?: string = 'inherit';

  /**
   * Especifica o label a ser utilizado para acessibilidade.
   * Por padrão irá assumir o nome do ícone.
   */
  @Prop({ reflect: true, mutable: true }) ariaLabel?: string;

  connectedCallback() {
    this.carregarIcone();
  }

  @Watch('icone')
  carregarIcone() {
    if (isNill(this.icone)) {
      return;
    }

    const label = this.icone.replace(/-/, ' ');
    this.ariaLabel = this.ariaLabel || label;
  }

  render() {
    return (
      <Host role="img">
        <i class={`mdi mdi-${this.icone}`} style={{ 'font-size': this.tamanho, 'color': this.cor }}>
        </i>
      </Host>
    );
  }

}
