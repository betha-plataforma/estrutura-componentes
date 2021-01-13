import { Component, Listen, State, Event, h, Watch, Element, EventEmitter, Prop, ComponentInterface } from '@stencil/core';

import { isValidAuthorizationConfig, PaginationQueryParams } from '../../global/api';
import { AuthorizationConfig } from '../../global/interfaces';
import { isNill } from '../../utils/functions';
import { PromiseTracker } from '../../utils/promise-tracker';
import { ConteudoSinalizadoEvent } from '../app/app.interfaces';
import { LIMITE_PAGINACAO, MessageType, ReadAction } from './notificacoes.constants';
import { TipoNotificacao, OpcaoFiltro, Notificacao, NotificacaoLeituraEvent, NotificacaoComLinkEvent, NotificacaoWebsocketMessage } from './notificacoes.interfaces';
import { NotificacoesService } from './notificacoes.service';
import { sortByDateTime } from './notificacoes.utils';
import { NotificationWebSocket } from './notificacoes.websocket';


@Component({
  tag: 'bth-notificacoes',
  styleUrl: 'notificacoes.scss',
  shadow: true
})
export class Notificacoes implements ComponentInterface {

  private notificacoesService: NotificacoesService;
  private websocket: NotificationWebSocket;

  private carregouTodasEmProgresso: boolean = false;
  private carregouTodasNaoLidas: boolean = false;
  private carregouTodasLidas: boolean = false;
  private carregouNaoLidas: boolean = false;
  private carregouLidas: boolean = false;
  private carregouEmProgresso: boolean = false;

  private tracker = new PromiseTracker((active: boolean) => {
    this.isBuscandoNotificacoes = active;
  });

  @Element() el!: HTMLBthNotificacoesElement;

  @State() isInicializado: boolean = false;

  @State() filtros: Array<OpcaoFiltro> = [
    { id: TipoNotificacao.NaoLida, icone: 'email-outline', descricao: 'Não lidas', ativo: true },
    { id: TipoNotificacao.Lida, icone: 'email-open-outline', descricao: 'Lidas' },
    { id: TipoNotificacao.Progresso, icone: 'clock-check-outline', descricao: 'Em andamento' },
  ]

  @State() notificacoesNaoLidas: Notificacao[] = [];
  @State() notificacoesLidas: Notificacao[] = []
  @State() notificacoesEmProgresso: Notificacao[] = []

  @State() quantidadeTotalNaoLidas: number = 0;
  @State() quantidadeEmProgressoNaoLidas: number = 0;
  @State() quantidadeEmNaoLidas: number = 0;

  @State() isBuscandoNotificacoes: boolean = false;
  @State() isApiIndisponivel: boolean = false;

  /**
   * Configuração de autorização. É necessária para o componente poder realizar autentizar com os serviços.
   */
  @Prop() readonly authorization: AuthorizationConfig;

  /**
   * True, exibe somente o box de notificações, sem barra e badge
   */
  @Prop() readonly onlyContent?: boolean;

  /**
   * Altura do painel de notificações
   */
  @Prop() readonly heightPainelNotificacoes?: string;

  /**
   * URL para a api de notificações. Por padrão irá obter do env.js
   */
  @Prop() readonly notificacoesApi?: string;

  /**
   * URL para o channel websocket de notificações. Por padrão irá obter do env.js
   */
  @Prop() readonly notificacoesWs?: string;

  /**
   * É emitido quando houver notificações lidas ou não lidas a ser sinalizadas ao menu
   */
  @Event() conteudoSinalizado: EventEmitter<ConteudoSinalizadoEvent>;

  /**
   * É emitido quando alguma notificação do tipo mensagem for recebida
   */
  @Event() novaNotificacaoComLink: EventEmitter<NotificacaoComLinkEvent>;

  @Listen('painelLateralShow')
  onPainelLateralShow(data: CustomEvent): void {
    if (data.detail.show === true) {
      this.setFiltroNotificacaoPadrao();
    }
  }

  @Listen('notificacaoLida')
  onNotificacaoLida(event: CustomEvent<NotificacaoLeituraEvent>): void {
    if (!isNill(event.detail.url)) {
      window.open(event.detail.url, event.detail.target);
    }

    const notificacao = this.notificacoesNaoLidas.find(naoLida => naoLida.id === event.detail.id);

    if (isNill(notificacao)) {
      return;
    }

    this.notificacoesService
      .setRead(event.detail.id)
      .catch(() => {
        this.marcarNotificacaoComoNaoLida(notificacao);
      });

    this.marcarNotificacaoComoLida(notificacao);
  }

  @Listen('notificacaoNaoLida')
  onNotificacaoNaoLida(event: CustomEvent<NotificacaoLeituraEvent>): void {
    const notificacao = this.notificacoesLidas.find(naoLida => naoLida.id === event.detail.id);

    if (isNill(notificacao)) {
      return;
    }

    this.notificacoesService
      .setUnread(event.detail.id)
      .catch(() => {
        this.marcarNotificacaoComoLida(notificacao);
      });

    this.marcarNotificacaoComoNaoLida(notificacao);
  }

  @Listen('navbarPillItemClicked')
  onNavbarPillItemClicked(data: CustomEvent): void {
    const { identificador } = data.detail;
    this.setFiltroNotificacao(TipoNotificacao[identificador]);
  }

  connectedCallback() {
    this.inicializarServices();
  }

  disconnectedCallback() {
    if (!isNill(this.websocket)) {
      this.websocket.close();
    }
  }

  @Watch('quantidadeTotalNaoLidas')
  onChangeQuantidadeTotalNaoLidas(novoValor): void {
    const event: ConteudoSinalizadoEvent = {
      possui: true,
      origem: 'notificacoes',
      quantidadeTotalNaoLidas: novoValor
    };

    if (novoValor <= 0) {
      event.possui = false;
    }

    this.conteudoSinalizado.emit(event);
  }

  @Watch('authorization')
  @Watch('notificacoesApi')
  @Watch('notificacoesWs')
  onChangeApiRelatedProperties(): void {
    if (!isNill(this.websocket)) {
      this.websocket.close();
    }

    this.inicializarServices();
  }

  private inicializarServices() {
    if (this.isConfiguracaoApiInconsistente()) {
      console.warn('[bth-notificacoes] O endereço do serviço de notificações e as credenciais de autenticação devem ser informados. Consulte a documentação do componente.');
      this.isApiIndisponivel = true;
      return;
    }

    this.isApiIndisponivel = false;

    this.notificacoesService = new NotificacoesService(this.authorization, this.getNotificacoesApi());
    this.inicializarWebSocket();

    this.resetarListasNotificacoes();
    this.isInicializado = true;
  }

  private isConfiguracaoApiInconsistente() {
    if (isNill(this.getNotificacoesApi())) {
      return true;
    }

    if (!isValidAuthorizationConfig(this.authorization)) {
      return true;
    }

    return false;
  }

  private setFiltroNotificacaoPadrao() {
    if (this.quantidadeEmNaoLidas > 0) {
      this.setFiltroNotificacao(TipoNotificacao.NaoLida);
    } else if (this.quantidadeEmProgressoNaoLidas > 0) {
      this.setFiltroNotificacao(TipoNotificacao.Progresso);
    } else {
      this.setFiltroNotificacao(TipoNotificacao.Lida);
    }
  }

  private getNotificacoesApi(): string {
    if (!isNill(this.notificacoesApi)) {
      return this.notificacoesApi;
    }

    if ('___bth' in window) {
      return window['___bth']?.envs?.suite?.['notifications']?.v1?.host;
    }

    return null;
  }

  private getNotificacoesWs(): string {
    if (!isNill(this.notificacoesWs)) {
      return this.notificacoesWs;
    }

    if ('___bth' in window) {
      return window['___bth']?.envs?.suite?.['notifications-ws']?.v1?.host + '/v2/channel';
    }

    return null;
  }

  private inicializarWebSocket(): void {
    this.websocket = new NotificationWebSocket(this.authorization, this.getNotificacoesWs());

    this.websocket.addEventListener('message', (event: MessageEvent) => {
      this.isApiIndisponivel = false;

      if (/type/.test(event.data)) {
        const message: NotificacaoWebsocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case MessageType.STARTED:
            this.onWebsocketStarted(message);
            break;
          case MessageType.NEW_NOTIFICATIONS:
            this.onWebsocketNewNotifications(message);
            break;
          case MessageType.READ_ACTION:
            this.onWebsocketReadAction(message);
            break;
          default:
            break;
        }
      }
    });

    this.websocket.addEventListener('error', () => {
      this.isApiIndisponivel = true;
    });
  }

  private onWebsocketStarted(message: NotificacaoWebsocketMessage): void {
    this.quantidadeTotalNaoLidas = message.unread;
    this.quantidadeEmProgressoNaoLidas = message.unreadInProgress;
    this.quantidadeEmNaoLidas = this.quantidadeTotalNaoLidas - this.quantidadeEmProgressoNaoLidas;
    this.setFiltroNotificacaoPadrao();
  }

  private onWebsocketNewNotifications(message: NotificacaoWebsocketMessage): void {
    message.notifications.forEach(notification => {
      this.addNovaMensagem(notification);
    });
  }

  private addNovaMensagem(message: Notificacao): void {
    if (message.priority === 1) {
      this.addMensagemAltaPrioridade(message);
    } else {
      this.addMensagemNaoLida(message);
    }

    if (!isNill(message.link)) {
      this.novaNotificacaoComLink.emit({ texto: message.text, link: message.link });
    }
  }

  private addMensagemNaoLida(message: Notificacao): void {
    this.quantidadeTotalNaoLidas++;
    this.quantidadeEmNaoLidas++;

    this.notificacoesNaoLidas.unshift(message);
    this.notificacoesNaoLidas.sort(sortByDateTime);
  }

  private addMensagemAltaPrioridade(message: Notificacao): void {
    this.removerDeTodasListas(message.id);

    if (message.status === 'OPEN') {
      this.quantidadeTotalNaoLidas++;
      this.quantidadeEmProgressoNaoLidas++;
      this.notificacoesEmProgresso.unshift(message);
      this.notificacoesEmProgresso.sort(sortByDateTime);
    } else {
      if (message.read) {
        this.notificacoesLidas.unshift(message);
        this.notificacoesLidas.sort(sortByDateTime);
      } else {
        this.addMensagemNaoLida(message);
      }
    }
  }

  private removerDeTodasListas(id: string): void {
    this.notificacoesEmProgresso = this.notificacoesEmProgresso.filter(emProgresso => emProgresso.id !== id);
    this.notificacoesLidas = this.notificacoesLidas.filter(lidas => lidas.id !== id);
    this.notificacoesNaoLidas = this.notificacoesNaoLidas.filter(naoLidas => naoLidas.id !== id);
  }

  private onWebsocketReadAction(message: NotificacaoWebsocketMessage): void {
    switch (message.readAction.action) {
      case ReadAction.READ_MESSAGE:
        this.marcarNotificacaoComoLida(message.readAction.message);
        break;
      case ReadAction.UNREAD_MESSAGE:
        this.marcarNotificacaoComoNaoLida(message.readAction.message);
        break;
      case ReadAction.READ_ALL_CLOSED:
        this.marcarTodasComoLida();
        break;
      case ReadAction.READ_ALL_IN_PROGRESS:
        this.marcarTodasEmProgressoComoLida();
        break;
      case ReadAction.READ_ALL:
        this.quantidadeTotalNaoLidas = 0;
        this.quantidadeEmNaoLidas = 0;
        this.resetarListasNotificacoes();
        break;
      default:
        break;
    }
  }

  private marcarTodasComoLida(): void {
    this.quantidadeTotalNaoLidas -= this.quantidadeEmNaoLidas;
    this.quantidadeEmNaoLidas = 0;
    this.resetarListasNotificacoes();
  }

  private resetarListasNotificacoes(): void {
    this.notificacoesNaoLidas = [];
    this.notificacoesLidas = [];
    this.notificacoesEmProgresso = [];
    this.carregouTodasEmProgresso = false;
    this.carregouTodasNaoLidas = false;
    this.carregouTodasLidas = false;
    this.carregouNaoLidas = false;
    this.carregouLidas = false;
    this.carregouEmProgresso = false;
  }

  private marcarTodasEmProgressoComoLida(): void {
    this.quantidadeTotalNaoLidas -= this.quantidadeEmProgressoNaoLidas;
    this.quantidadeEmProgressoNaoLidas = 0;
  }

  private marcarNotificacaoComoLida(notificacao: Notificacao): void {
    const novasNotificacoesNaoLidas = this.notificacoesNaoLidas.filter(item => {
      return notificacao.id !== item.id;
    });

    if (novasNotificacoesNaoLidas.length !== this.notificacoesNaoLidas.length) {
      notificacao.read = true;
      this.quantidadeTotalNaoLidas--;
      this.quantidadeEmNaoLidas--;

      this.notificacoesLidas.push(notificacao);
      this.notificacoesLidas.sort(sortByDateTime);

      this.notificacoesNaoLidas = novasNotificacoesNaoLidas;
    }

    if (this.notificacoesNaoLidas.length < LIMITE_PAGINACAO) {
      this.carregarNotificacoes();
    }
  }

  private marcarNotificacaoComoNaoLida(notificacao: Notificacao): void {
    const novasNotificacoesLidas = this.notificacoesLidas.filter(item => {
      return notificacao.id !== item.id;
    });

    if (novasNotificacoesLidas.length !== this.notificacoesLidas.length) {
      notificacao.read = false;
      this.quantidadeTotalNaoLidas++;
      this.quantidadeEmNaoLidas++;

      this.notificacoesNaoLidas.push(notificacao);
      this.notificacoesNaoLidas.sort(sortByDateTime);

      this.notificacoesLidas = novasNotificacoesLidas;
    }

    if (this.notificacoesLidas.length < LIMITE_PAGINACAO) {
      this.carregarNotificacoes();
    }
  }

  private onClickMarcarTodasComoLidas = (event: Event): void => {
    event.preventDefault();

    if (this.quantidadeEmNaoLidas > 0) {
      this.notificacoesService.clearUnreads();
      this.marcarTodasComoLida();
    }
  }

  private carregarNotificacoesNaoLidas(): void {
    if (this.isConfiguracaoApiInconsistente()) {
      return;
    }

    let promise = this.notificacoesService
      .buscarNaoLidas(this.getPaginationQueryParams(this.notificacoesNaoLidas.length))
      .then(notificacoesNaoLidas => {
        this.carregouNaoLidas = true;
        this.notificacoesNaoLidas = this.notificacoesNaoLidas.concat(notificacoesNaoLidas.content).sort(sortByDateTime);
        this.carregouTodasNaoLidas = !notificacoesNaoLidas.hasNext;

        this.quantidadeEmNaoLidas = this.notificacoesNaoLidas.length + this.quantidadeEmProgressoNaoLidas;
        this.quantidadeTotalNaoLidas = this.quantidadeEmNaoLidas + this.quantidadeEmProgressoNaoLidas;
      })
      .catch(() => {
        this.isApiIndisponivel = true;
      });

    this.tracker.addPromise(promise);
  }

  private carregarNotificacoesLidas(): void {
    if (this.isConfiguracaoApiInconsistente()) {
      return;
    }

    let promise = this.notificacoesService
      .buscarLidas(this.getPaginationQueryParams(this.notificacoesLidas.length))
      .then(notificacoesLidas => {
        this.carregouLidas = true;
        this.notificacoesLidas = this.notificacoesLidas.concat(notificacoesLidas.content).sort(sortByDateTime);
        this.carregouTodasLidas = !notificacoesLidas.hasNext;
      })
      .catch(() => {
        this.isApiIndisponivel = true;
      });

    this.tracker.addPromise(promise);
  }

  private carregarNotificacoesEmProgresso(): void {
    if (this.isConfiguracaoApiInconsistente()) {
      return;
    }

    let promise = this.notificacoesService
      .buscarEmProgresso(this.getPaginationQueryParams(this.notificacoesEmProgresso.length))
      .then(notificacoesEmProgresso => {
        this.carregouEmProgresso = true;
        this.notificacoesEmProgresso = this.notificacoesEmProgresso.concat(notificacoesEmProgresso.content).sort(sortByDateTime);
        this.carregouTodasEmProgresso = !notificacoesEmProgresso.hasNext;
      })
      .catch(() => {
        this.isApiIndisponivel = true;
      });

    this.tracker.addPromise(promise);
  }

  private getPaginationQueryParams(offset: number): PaginationQueryParams {
    return { offset: offset, limit: LIMITE_PAGINACAO };
  }

  private getOpcaoFiltroAtivo(): OpcaoFiltro {
    return this.filtros.filter(filtro => filtro.ativo === true)[0];
  }

  private setFiltroNotificacao(filtro: TipoNotificacao) {
    this.filtros = this.filtros.map(_filtro => {
      _filtro.ativo = _filtro.id === filtro;
      return _filtro;
    });

    let filtroAtivo = this.getOpcaoFiltroAtivo();

    if (!this.carregouLidas && filtroAtivo.id === TipoNotificacao.Lida) {
      this.carregarNotificacoesLidas();
      return;
    }

    if (!this.carregouNaoLidas && filtroAtivo.id === TipoNotificacao.NaoLida) {
      this.carregarNotificacoesNaoLidas();
      return;
    }

    if (!this.carregouEmProgresso && filtroAtivo.id === TipoNotificacao.Progresso) {
      this.carregarNotificacoesEmProgresso();
      return;
    }
  }

  private hasNotificacoes(): boolean {
    if (this.isFiltroPorLidas()) {
      return this.notificacoesLidas.length > 0;
    }

    if (this.isFiltroPorNaoLidas()) {
      return this.notificacoesNaoLidas.length > 0;
    }

    if (this.isFiltroPorProgresso()) {
      return this.notificacoesEmProgresso.length > 0;
    }

    return false;
  }

  private getNotificacoesPorFiltroAtivo(): Notificacao[] {
    if (this.isFiltroPorLidas()) {
      return this.notificacoesLidas;
    }

    if (this.isFiltroPorNaoLidas()) {
      return this.notificacoesNaoLidas;
    }

    if (this.isFiltroPorProgresso()) {
      return this.notificacoesEmProgresso;
    }
  }

  private isFiltroPorLidas(): boolean {
    return this.getOpcaoFiltroAtivo().id === TipoNotificacao.Lida;
  }

  private isFiltroPorNaoLidas(): boolean {
    return this.getOpcaoFiltroAtivo().id === TipoNotificacao.NaoLida;
  }

  private isFiltroPorProgresso(): boolean {
    return this.getOpcaoFiltroAtivo().id === TipoNotificacao.Progresso;
  }

  private onContentScroll = (ev): void => {
    const target = ev.target;
    const isEnd = target.offsetHeight + target.scrollTop >= target.scrollHeight;

    if (isEnd) {
      this.carregarNotificacoes();
    }
  }

  private carregarNotificacoes(): void {
    if (this.isBuscandoNotificacoes || this.isApiIndisponivel) {
      return;
    }

    const filtroAtivo = this.getOpcaoFiltroAtivo();

    if (filtroAtivo.id === TipoNotificacao.Lida && !this.carregouTodasLidas) {
      this.carregarNotificacoesLidas();
      return;
    }

    if (filtroAtivo.id === TipoNotificacao.NaoLida && !this.carregouTodasNaoLidas) {
      this.carregarNotificacoesNaoLidas();
      return;
    }

    if (filtroAtivo.id === TipoNotificacao.Progresso && !this.carregouTodasEmProgresso) {
      this.carregarNotificacoesEmProgresso();
      return;
    }
  }

  private renderLoader() {
    if (!this.isBuscandoNotificacoes) {
      return;
    }

    const isPageLoader = this.getNotificacoesPorFiltroAtivo().length <= 0;

    return (
      <div class={`loader ${isPageLoader ? 'loader--full-page' : 'loader--list-bottom'}`}>
        <bth-loader></bth-loader>
      </div>
    );
  }

  private getHeightPainelNotificacoes() {
    const style: any = {};

    if (!isNill(this.heightPainelNotificacoes)) {
      style.height = this.heightPainelNotificacoes;
    }

    return style;
  }

  render() {
    const notificacoesConteudo = () => [
      <div>
        {!this.isApiIndisponivel && (
          <bth-navbar-pill-group descricao="Notificações">
            {this.filtros.map(filtro => (
              <bth-navbar-pill-item
                key={filtro.id.toString()}
                identificador={filtro.id.toString()}
                icone={filtro.icone}
                descricao={filtro.descricao}
                ativo={filtro.ativo}
                totalizador={filtro.id === TipoNotificacao.NaoLida ? this.quantidadeEmNaoLidas : (filtro.id === TipoNotificacao.Progresso ? this.quantidadeEmProgressoNaoLidas : 0)}
                showTotalizador={!this.isBuscandoNotificacoes}>
              </bth-navbar-pill-item>
            ))}
          </bth-navbar-pill-group>
        )}

        {!this.isApiIndisponivel && this.hasNotificacoes() && this.isFiltroPorNaoLidas() && !this.isBuscandoNotificacoes && (
          <div class="text-right">
            <a class="link" href="" title="Marcar todas como lidas" onClick={this.onClickMarcarTodasComoLidas}>Marcar todas como lidas</a>
          </div>
        )}

        <div style={this.getHeightPainelNotificacoes()} class="painel-notificacoes" onScroll={this.onContentScroll}>

          {!this.isApiIndisponivel && !this.hasNotificacoes() && !this.isBuscandoNotificacoes && (
            <div class="empty-notificacoes">
              <div class="empty-notificacoes__img"></div>
              <h4>Não há notificações por aqui</h4>
            </div>
          )}

          {this.isApiIndisponivel && !this.isBuscandoNotificacoes && (
            <div class="empty-notificacoes">
              <div class="empty-notificacoes-inconsistency"></div>
              <h4>As notificações estão temporariamente indisponíveis</h4>
            </div>
          )}

          {!this.isApiIndisponivel && (
            <ul class="notificacoes-lista">
              {this
                .getNotificacoesPorFiltroAtivo()
                .map(notificacao => (
                  <li key={notificacao.id}>
                    <bth-notificacao-item
                      identificador={notificacao.id}
                      tipo={this.getOpcaoFiltroAtivo().id}
                      texto={notificacao.text}
                      dataHora={notificacao.dateTime}
                      origem={notificacao.source}
                      icone={notificacao.icon}
                      resultadoLink={notificacao.link}
                      cancelamentoLink={notificacao.cancellationLink}
                      acompanharLink={notificacao.trackingLink}
                      possuiProgresso={notificacao.progress}
                      percentualProgresso={notificacao.percentage}
                      status={notificacao.status}
                      prioridade={notificacao.priority}>
                    </bth-notificacao-item>
                  </li>
                ))}
            </ul>
          )}

          {this.renderLoader()}

        </div>
      </div>
    ];

    if (this.onlyContent) return (
      <div>
        {notificacoesConteudo()}
      </div>
    );

    return (
      <bth-menu-ferramenta descricao="Notificações" tituloPainelLateral="Notificações">

        <bth-menu-ferramenta-icone slot="menu_item_mobile" icone="bell" contador={this.quantidadeTotalNaoLidas} mobile></bth-menu-ferramenta-icone>
        <span slot="menu_descricao_mobile" class="descricao-mobile">Notificações</span>

        <bth-menu-ferramenta-icone slot="menu_item_desktop" icone="bell" contador={this.quantidadeTotalNaoLidas}></bth-menu-ferramenta-icone>

        <section slot="conteudo_painel_lateral">
          {notificacoesConteudo()}
        </section>
      </bth-menu-ferramenta>
    );
  }
}
