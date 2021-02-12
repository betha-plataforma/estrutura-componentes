import { Component, h, Prop, EventEmitter, Event, ComponentInterface } from '@stencil/core';

import { getDataHoraDescrita } from '../../../utils/date';
import { isNill } from '../../../utils/functions';
import { getIcone, getIconeTitle } from '../notificacoes-sistemas.config';
import { NotificacaoLink, TipoNotificacao, NotificacaoLeituraEvent } from '../notificacoes.interfaces';

@Component({
  tag: 'bth-notificacao-item',
  styleUrl: 'notificacao-item.scss',
  shadow: true,
})
export class NotificacaoItem implements ComponentInterface {

  /**
   * Identificador
   */
  @Prop() readonly identificador: string;

  /**
   * Tipo de notificação
   */
  @Prop() readonly tipo: TipoNotificacao;

  /**
   * Texto
   */
  @Prop() readonly texto: string;

  /**
   * Data e hora
   */
  @Prop() readonly dataHora: number;

  /**
   * Origem
   */
  @Prop() readonly origem: string;

  /**
   * Ícone
   */
  @Prop() readonly icone: string;

  /**
   * Link resultado
   */
  @Prop() readonly resultadoLink: NotificacaoLink;

  /**
   * Link cancelamento
   */
  @Prop() readonly cancelamentoLink: NotificacaoLink;

  /**
   * Link acompanhar
   */
  @Prop() readonly acompanharLink: NotificacaoLink;

  /**
   * Possui progresso?
   */
  @Prop() readonly possuiProgresso: boolean;

  /**
   * Percentual do progresso
   */
  @Prop() readonly percentualProgresso: number;

  /**
   * Status
   */
  @Prop() readonly status: string;

  /**
   * Prioridade
   */
  @Prop() readonly prioridade: number;

  /**
   * É emitido quando uma notificação é marcada como lida
   */
  @Event() notificacaoLida: EventEmitter;

  /**
   * É emitido quando uma notificação é marcada como não lida
   */
  @Event() notificacaoNaoLida: EventEmitter;

  private onClickPainel = (event: UIEvent) => {
    if (this.isLida() || this.isProgressoEmAndamento()) {
      return;
    }

    return this.onClick(event);
  }

  private onClick = (event: UIEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const payload: NotificacaoLeituraEvent = {
      id: this.identificador
    };

    if (this.isLida()) {
      this.notificacaoNaoLida.emit(payload);
      return;
    }

    if (!isNill(this.resultadoLink)) {
      payload.url = this.resultadoLink.href;
      payload.target = this.getLinkTarget(this.resultadoLink);
    }

    this.notificacaoLida.emit(payload);
  }

  private isLida(): boolean {
    return this.tipo === TipoNotificacao.Lida;
  }

  private isOrigemUsuario(): boolean {
    return /^user/.test(this.origem);
  }

  private isOrigemSistema(): boolean {
    return /^system/.test(this.origem);
  }

  private getClassIcone(): string {
    if (!isNill(this.icone)) {
      return this.icone;
    }

    const sistema = this.getSistema();
    return getIcone(sistema);
  }

  private getSistema(): string {
    if (this.isOrigemSistema()) {
      return this.origem.split('@')[1];
    }
  }

  private isProgressoEmAndamento(): boolean {
    return this.isProgresso() && this.isProgressoVisualizado();
  }

  private isProgresso(): boolean {
    return this.prioridade === 1;
  }

  private isProgressoVisualizado(): boolean {
    return this.status === 'OPEN';
  }

  private getPercentualProgressoStyle() {
    return {
      width: `${this.percentualProgresso === null ? 100 : this.percentualProgresso}%`
    };
  }

  private getTitleNotificacao(): string {
    if (this.isLida()) {
      return;
    }

    return this.possuiLinkResultado() ? this.getTitleLinkResultado() : 'Marcar como lido';
  }

  private possuiLinkResultado(): boolean {
    return Boolean(this.resultadoLink);
  }

  private getTitleLinkResultado(): string {
    return this.resultadoLink.title;
  }

  private possuiLinkResultadoParaExibir(): boolean {
    return this.possuiLinkResultado() && !this.isProgressoEmAndamento();
  }

  private possuiLinkAcompanharParaExibir(): boolean {
    return this.isProgressoVisualizado() && this.possuiLinkProgresso();
  }

  private possuiLinkProgresso(): boolean {
    return Boolean(this.acompanharLink);
  }

  private possuiLinkCancelarParaExibir(): boolean {
    return this.possuiLinkCancelar() && this.isProgressoVisualizado();
  }

  private possuiLinkCancelar(): boolean {
    return Boolean(this.cancelamentoLink);
  }

  private getLinkTarget(link: NotificacaoLink): string {
    switch (link.target) {
      case 'SELF':
        return '_self';
      case 'BLANK':
        return '_blank';
      default:
        return '_self';
    }
  }

  render() {
    return (
      <div
        onClick={this.onClickPainel}
        title={this.getTitleNotificacao()}
        class={`notificacao ${!this.isLida() && !this.isProgressoEmAndamento() ? 'notificacao--unread' : ''}`}>

        <div class="notificacao__body">

          <div class="icon">
            {this.isOrigemUsuario() ?
              <bth-icone icone="account"></bth-icone> :
              <bth-icone icone={this.getClassIcone()} title={getIconeTitle(this.getSistema())}></bth-icone>}
          </div>

          <p class="mensagem">{this.texto}</p>

          {!this.isProgressoEmAndamento() && (
            <a href="" title={`Marcar como ${!this.isLida() ? 'lido' : 'não lido'}`} onClick={this.onClick}>
              <bth-icone class="marcar-leitura__toggler" icone={!this.isLida() ? 'email-open-outline' : 'email-outline'}></bth-icone>
            </a>
          )}

        </div>

        {this.isProgressoEmAndamento() && (
          <div class={`notificacao__progress ${this.possuiProgresso ? 'notificacao__progress--success' : 'notificacao__progress--indeterminate'}`}>
            {this.possuiProgresso && (
              <div class="notificacao__progress__percent">{this.percentualProgresso === null ? 0 : this.percentualProgresso}%</div>
            )}
            <div class="notificacao__progress__bar" style={this.getPercentualProgressoStyle()}></div>
          </div>
        )}

        <div class="notificacao__footer">
          {this.possuiLinkResultadoParaExibir() && (
            <a
              href={this.resultadoLink.href}
              title={this.resultadoLink.title}
              target={this.getLinkTarget(this.resultadoLink)}
              rel="noreferrer">{this.resultadoLink.label}</a>
          )}

          {this.possuiLinkAcompanharParaExibir() && (
            <a
              href={this.acompanharLink.href}
              title={this.acompanharLink.title}
              target={this.getLinkTarget(this.acompanharLink)}
              rel="noreferrer">Acompanhar</a>
          )}

          {this.possuiLinkAcompanharParaExibir() && this.possuiLinkCancelarParaExibir() && (
            <span>&nbsp;|&nbsp;</span>
          )}

          {this.possuiLinkCancelarParaExibir() && (
            <a
              href={this.cancelamentoLink.href}
              title={this.cancelamentoLink.title}
              target={this.getLinkTarget(this.cancelamentoLink)}
              rel="noreferrer">Cancelar</a>
          )}

          {this.dataHora && (<span class="float-right" title={getDataHoraDescrita(this.dataHora)}>{getDataHoraDescrita(this.dataHora)}</span>)}
        </div>
      </div>
    );
  }

}
