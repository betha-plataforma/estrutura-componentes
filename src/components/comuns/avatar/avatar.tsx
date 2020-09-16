import { Component, h, Host, Prop, Event, EventEmitter, ComponentInterface, Element } from '@stencil/core';

import { getCssVariableValue, isNill } from '../../../utils/functions';
import { Tamanho } from './avatar.interfaces';

const BG_COLORS = [
  'aqua',
  'blue',
  'green',
  'pink',
  'purple',
  'orange',
  'yellow'
];

/**
 * Este componente exibe um avatar
 */
@Component({
  tag: 'bth-avatar',
  styleUrl: 'avatar.scss',
  shadow: true
})
export class Avatar implements ComponentInterface {

  @Element() el!: HTMLBthAvatarElement;

  /**
   * Define um avatar de ícone conforme biblioteca `"Material Design Icons"`
   */
  @Prop({ reflect: true }) readonly icone?: string;

  /**
   * Define um sub-ícone conforme biblioteca `"Material Design Icons"`
   */
  @Prop({ reflect: true }) readonly subIcone?: string;

  /**
    * Define o "title" do subícone
    */
  @Prop({ reflect: true }) readonly subIconeTitle: string = '';

  /**
   * Define a fonte de um avatar de imagem. Aceita imagem e svg.
   */
  @Prop({ reflect: true }) readonly src?: string;

  /**
   * Define avatar do tipo iniciais, aceitando até 3 iniciais ou computando as iniciais automaticamente conforme palavras passadas
   */
  @Prop({ reflect: true }) readonly iniciais?: string;

  /**
   * Define o tamanho conforme dimensões pre-definidas para o avatar.
   *
   * Opções disponíveis: menor (24x24), pequeno (28x28), medio (48x48) e grande (94x94)
   */
  @Prop({ reflect: true }) readonly tamanho?: Tamanho = 'medio';

  /**
   * Permite definir a dimensão (largura, altura) em px para o avatar
   */
  @Prop({ reflect: true }) readonly dimensao?: number;

  /**
   * Define se o avatar terá suas bordas no formato quadrado.
   *
   * Por padrão é redondo
   */
  @Prop({ reflect: true }) readonly quadrado?: boolean = false;

  /**
   * Define se o avatar possui borda
   */
  @Prop({ reflect: true }) readonly borda?: boolean = false;

  /**
   * Define o tamanho da borda
   */
  @Prop({ reflect: true }) readonly bordaTamanho?: string = '1px';

  /**
   * Define o raio da borda do avatar. Caso informado, sobrescreve o atributo utilitario 'quadrado'.
   */
  @Prop({ reflect: true }) readonly bordaRaio?: string = '50%';

  /**
   * Define a cor da borda
   */
  @Prop({ reflect: true }) readonly bordaCor?: string = 'white';

  /**
  * É emitido quando houver erro ao carregar a imagem
  */
  @Event() imageLoadError: EventEmitter;

  private getSiglaIniciais(texto: string) {
    if (texto.length <= 2) {
      return texto.toUpperCase();
    }

    const palavras = texto.replace(/[^\w\s]/gi, '').split(' ');

    const iniciais = palavras.filter(palavra => Boolean(palavra))
      .map(palavra => palavra.substr(0, 1));

    return iniciais[0].concat(iniciais[1] ?? '').toUpperCase();
  }

  private getColorClass(): string {
    if (this.icone !== undefined) {
      return 'avatar-icone bg-blue tx-blue';
    }

    if (this.iniciais !== undefined) {
      let color = this.getCorInicias();
      return `bg-${color} tx-${color}`;
    }

    return '';
  }

  private getSizeClass(): string {
    if (isNill(this.tamanho) || !isNill(this.dimensao)) {
      return '';
    }

    if (this.tamanho === 'menor') {
      return 'avatar-extra-small';
    }

    if (this.tamanho === 'pequeno') {
      return 'avatar-small';
    }

    if (this.tamanho === 'medio') {
      return 'avatar-medium';
    }

    if (this.tamanho === 'grande') {
      return 'avatar-large';
    }

    return '';
  }

  private getRoundingClass(): string {
    if (this.quadrado) {
      return 'avatar-square';
    }

    return '';
  }

  private getCorInicias(): string {
    return BG_COLORS[this.iniciais.charCodeAt(0) % BG_COLORS.length];
  }

  private onImageLoadError = (event: Event): void => {
    this.imageLoadError.emit(event);
  }

  private getContainerCustomStyles() {
    const containerStyles: any = {};

    if (!isNill(this.dimensao)) {
      containerStyles.width = `${this.dimensao}px`;
      containerStyles.height = `${this.dimensao}px`;
      containerStyles.fontSize = `${this.dimensao / 2}px`;
    }

    return containerStyles;
  }

  private getImagemCustomStyles() {
    const imagemStyles: any = {};

    if (!isNill(this.borda)) {
      imagemStyles.border = `${this.bordaTamanho} solid ${this.bordaCor}`;
    }

    imagemStyles['border-radius'] = this.bordaRaio;

    return imagemStyles;
  }

  render() {
    return (
      <Host>
        <div class="avatar__container">
          <figure
            class={`avatar__body ${this.getRoundingClass()} ${this.getColorClass()} ${this.getSizeClass()}`}
            style={this.getContainerCustomStyles()}>

            {this.icone && (
              <bth-icone
                icone={this.icone}
                cor={getCssVariableValue('--bth-app-gray-light-40')}>
              </bth-icone>
            )}

            {this.src && (
              <img
                src={this.src}
                class={`avatar--imagem ${this.getRoundingClass()} ${this.getSizeClass()}`}
                style={this.getImagemCustomStyles()}
                alt={this.el.getAttribute('title') || 'Avatar'}
                onError={this.onImageLoadError} />
            )}

            {this.iniciais && (<span>{this.getSiglaIniciais(this.iniciais)}</span>)}
          </figure>
          {this.subIcone && (<bth-icone class="subicone" icone={this.subIcone} title={this.subIconeTitle}></bth-icone>)}
        </div>
      </Host>
    );
  }

}
