import { Component, h, Prop, EventEmitter, Event, ComponentInterface } from '@stencil/core';

import { getDataHoraDescrita } from '../../../utils/date';
import { NovidadeLeituraEvent } from '../novidades.interfaces';

@Component({
  tag: 'bth-novidade-item',
  styleUrl: 'novidade-item.scss',
  shadow: true,
})
export class NovidadeItem implements ComponentInterface {

  /**
   * Identificador
   */
  @Prop() readonly identificador: string;

  /**
   * Título
   */
  @Prop() readonly titulo: string;

  /**
   * Mensagem
   */
  @Prop() readonly mensagem: string;

  /**
   * Define se já está lida
   */
  @Prop() readonly isLida: boolean = false;

  /**
   * URL para obter mais informações
   */
  @Prop() readonly url: string;

  /**
   * Data e hora
   */
  @Prop() readonly dataHora: string;

  /**
   * É emitido quando uma novidade é marcada como lida
   */
  @Event() novidadeLida: EventEmitter<NovidadeLeituraEvent>;

  /**
   * É emitido quando uma novidade é marcada como não lida
   */
  @Event() novidadeNaoLida: EventEmitter<NovidadeLeituraEvent>;

  private onClickPainel = (event: UIEvent) => {
    if (this.isLida) {
      return;
    }

    return this.onClick(event);
  }

  private onClick = (event: UIEvent) => {
    event.preventDefault();

    if (this.isLida) {
      this.novidadeNaoLida.emit({ id: this.identificador });
    } else {
      this.novidadeLida.emit({ id: this.identificador, url: this.url });
    }
  }

  render() {
    return (
      <div
        onClick={this.onClickPainel}
        title={this.isLida ? '' : 'Abrir mais detalhes e marcar como lida'}
        class={`lista__item ${!this.isLida ? 'lista__item--unread' : ''}`}>

        <div class="lista__item--body">
          <bth-icone class="icone-gift" icone="gift"></bth-icone>

          <section>
            <h5 class="title" title={this.titulo}>{this.titulo}</h5>
            <p class="message" title={this.mensagem}>{this.mensagem}</p>
          </section>

          <a href="" class="marcar-leitura__toggler" onClick={this.onClick} title={this.isLida ? 'Marcar como não lida' : 'Marcar como lida'}>
            <bth-icone icone={this.isLida ? 'email-open-outline' : 'email-outline'}></bth-icone>
          </a>
        </div>

        <div class="lista__item--footer">
          <a href={this.url} title="Mais detalhes" target="_blank" rel="noreferrer">Mais detalhes</a>
          {this.dataHora && (<span class="float-right" title={getDataHoraDescrita(this.dataHora)}>{getDataHoraDescrita(this.dataHora)}</span>)}
        </div>
      </div>
    );
  }

}
