import { Component, h, Prop, Event, EventEmitter, ComponentInterface } from '@stencil/core';

@Component({
  tag: 'bth-navbar-pill-item',
  styleUrl: 'navbar-pill-item.scss',
  shadow: true,
})
export class NavbarPillItem implements ComponentInterface {

  /**
   * Identificador.
   * É enviado no evento de click.
   */
  @Prop() readonly identificador: any;

  /**
   * Descrição
   */
  @Prop() readonly descricao: string;

  /**
   * Está ativo?
   */
  @Prop({ reflect: true }) readonly ativo: boolean = false;

  /**
   * Ícone conforme biblioteca `"Material Design Icons"`
   */
  @Prop() readonly icone: string = 'cloud-question';

  /**
   * Totalizador
   */
  @Prop() readonly totalizador: number = 0;

  /**
   * Exibir totalizador?
   */
  @Prop() readonly showTotalizador: boolean = true;

  /**
   * É emitido ao clicar no filtro
   */
  @Event() navbarPillItemClicked: EventEmitter;

  private onClick = (event: UIEvent) => {
    event.preventDefault();
    this.navbarPillItemClicked.emit({
      identificador: this.identificador
    });
  }

  render() {
    return (
      <div role="menuitem" class={`navbar-pill-item ${this.ativo ? 'navbar-pill-item--active' : ''}`}>
        <a href="" title={this.descricao} onClick={this.onClick}>
          <bth-icone icone={this.icone}></bth-icone>
          <span class={`descricao ${this.ativo ? 'descricao--show' : ''}`}>{this.descricao}</span>
          {this.showTotalizador && this.totalizador !== 0 && (<span class="totalizador">({this.totalizador})</span>)}
        </a>
      </div>
    );
  }

}
