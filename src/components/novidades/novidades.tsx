import { Component, ComponentInterface, h, forceUpdate, State, Prop, Watch, EventEmitter, Event, Listen } from '@stencil/core';

import { isValidAuthorizationConfig } from '../../global/api';
import { AuthorizationConfig } from '../../global/interfaces';
import { isNill } from '../../utils/functions';
import { ConteudoSinalizadoEvent } from '../app/app.interfaces';
import { POLLING_INTERVAL } from './novidades.constants';
import { FiltroNovidade, OpcaoFiltro, Novidade, NovidadeLeituraEvent } from './novidades.interfaces';
import { NovidadesService } from './novidades.service';
import { sortByDataInicial } from './novidades.utils';

@Component({
  tag: 'bth-novidades',
  styleUrl: 'novidades.scss',
  shadow: true
})
export class Novidades implements ComponentInterface {

  private novidadesService: NovidadesService;
  private pollingHandler: any;

  @State() isBuscandoNovidades: boolean = false;

  @State() isApiIndisponivel: boolean = false;

  @State() filtros: Array<OpcaoFiltro> = [
    { id: FiltroNovidade.NaoLida, descricao: 'Não lidas', icone: 'email-outline', ativo: true },
    { id: FiltroNovidade.Lida, descricao: 'Lidas', icone: 'email-open-outline' },
  ]

  @State() novidades: Novidade[] = [];

  /**
   * Configuração de autorização. É necessária para o componente poder realizar autentizar com os serviços.
   */
  @Prop() readonly authorization: AuthorizationConfig;

  /**
   * URL para a api de novidades. Por padrão irá obter do env.js.
   */
  @Prop() readonly novidadesApi?: string;

  /**
   * É emitido quando houver novidades lidas ou não lidas a ser sinalizadas ao menu
   */
  @Event() conteudoSinalizado: EventEmitter<ConteudoSinalizadoEvent>;

  @Listen('painelLateralShow')
  onPainelLateralShow(data: CustomEvent): void {
    if (data.detail.show === true) {
      this.setFiltroNovidadePadrao();
    }
  }

  @Listen('novidadeLida')
  onNovidadeLida(data: CustomEvent<NovidadeLeituraEvent>): void {
    const { id, url } = data.detail;
    this.novidadesService.marcarComoLida(id);
    window.open(url, '_blank');

    forceUpdate(this);
    this.atualizarIndicadorConteudoSinalizado();
  }

  @Listen('novidadeNaoLida')
  onNovidadeNaoLida(data: CustomEvent<NovidadeLeituraEvent>): void {
    const { id } = data.detail;
    this.novidadesService.marcarComoNaoLida(id);

    forceUpdate(this);
    this.atualizarIndicadorConteudoSinalizado();
  }

  @Listen('navbarPillItemClicked')
  onNavbarPillItemClicked(data: CustomEvent): void {
    const { identificador } = data.detail;
    this.setFiltroNovidade(FiltroNovidade[identificador]);
  }

  @Watch('authorization')
  watchAuthorization() {
    this.handleBuscar();
  }

  @Watch('novidadesApi')
  watchNovidadesApi() {
    return this.handleBuscar();
  }

  connectedCallback() {
    return this.handleBuscar();
  }

  disconnectedCallback() {
    window.clearInterval(this.pollingHandler);
  }

  private async handleBuscar() {
    this.stopPollingListener();

    await this.buscar();

    this.startPollingListener();
  }

  private stopPollingListener() {
    if (isNill(this.pollingHandler)) {
      return;
    }

    window.clearInterval(this.pollingHandler);
    this.pollingHandler = undefined;
  }

  private startPollingListener() {
    this.pollingHandler = setInterval(() => this.buscar(), POLLING_INTERVAL);
  }

  private async buscar() {
    if (this.isConfiguracaoApiInconsistente()) {
      console.warn('[bth-novidades] O endereço do serviço de novidades e as credenciais de autenticação devem ser informados. Consulte a documentação do componente.');
      this.isApiIndisponivel = true;
      return;
    }

    this.isApiIndisponivel = false;
    this.isBuscandoNovidades = true;
    try {
      this.novidadesService = new NovidadesService(this.authorization, this.getNovidadesApi());
      const novidades: Novidade[] = await this.novidadesService.buscar();
      this.novidades = [...novidades.sort(sortByDataInicial)];
      this.setFiltroNovidade(FiltroNovidade.NaoLida);
      this.atualizarIndicadorConteudoSinalizado();
    } catch {
      this.isApiIndisponivel = true;
    } finally {
      this.isBuscandoNovidades = false;
    }
  }

  private isConfiguracaoApiInconsistente() {
    if (isNill(this.getNovidadesApi())) {
      return true;
    }

    if (!isValidAuthorizationConfig(this.authorization)) {
      return true;
    }

    return false;
  }

  private setFiltroNovidadePadrao() {
    this.setFiltroNovidade(FiltroNovidade.NaoLida);
  }

  private onClickMarcarTodasComoLidas = (event: Event): void => {
    event.preventDefault();

    this.novidades
      .filter(novidade => !this.novidadesService.isLida(novidade.id))
      .forEach(novidade => this.novidadesService.marcarComoLida(novidade.id));

    forceUpdate(this);
    this.atualizarIndicadorConteudoSinalizado();
  }

  private atualizarIndicadorConteudoSinalizado() {
    const event: ConteudoSinalizadoEvent = {
      possui: true,
      origem: 'novidades'
    };

    if (this.getQtdNaoLidas() <= 0) {
      event.possui = false;
    }

    this.conteudoSinalizado.emit(event);
  }

  private getNovidadesApi(): string {
    if (!isNill(this.novidadesApi)) {
      return this.novidadesApi;
    }

    if ('___bth' in window) {
      return window['___bth'].envs.suite['avisos'].v1.host;
    }

    return null;
  }

  private setFiltroNovidade(novoFiltro: FiltroNovidade) {
    this.filtros = this.filtros.map(filtro => {
      filtro.ativo = filtro.id === novoFiltro;
      return filtro;
    });
  }

  private getQtdNaoLidas(): number {
    return this.novidades.filter(novidade => !this.novidadesService.isLida(novidade.id)).length;
  }

  private getQtdLidas(): number {
    return this.novidades.filter(novidade => this.novidadesService.isLida(novidade.id)).length;
  }

  private getOpcaoFiltroAtivo(): OpcaoFiltro {
    return this.filtros.filter(filtro => filtro.ativo === true)[0];
  }

  private isFiltroPorLidas(): boolean {
    return this.getOpcaoFiltroAtivo().id === FiltroNovidade.Lida;
  }

  private isFiltroPorNaoLidas(): boolean {
    return this.getOpcaoFiltroAtivo().id === FiltroNovidade.NaoLida;
  }

  private isEmptyStateVisible(): boolean {
    if (this.isApiIndisponivel) {
      return false;
    }

    if (this.isBuscandoNovidades) {
      return false;
    }

    if (this.isFiltroPorNaoLidas() && this.getQtdNaoLidas() === 0) {
      return true;
    }

    if (this.isFiltroPorLidas() && this.getQtdLidas() === 0) {
      return true;
    }

    return false;
  }

  private renderLoader() {
    if (!this.isBuscandoNovidades) {
      return;
    }

    const isPageLoader = this.novidades.length <= 0;

    return (
      <div class={`loader ${isPageLoader ? 'loader--full-page' : 'loader--list-bottom'}`}>
        <bth-loader></bth-loader>
      </div>
    );
  }

  render() {
    const totalNaoLida = this.getQtdNaoLidas();
    const totalLida = this.getQtdLidas();

    return (
      <bth-menu-ferramenta descricao="Novidades" tituloPainelLateral="Novidades">

        <bth-menu-ferramenta-icone slot="menu_item_mobile" icone="gift" contador={totalNaoLida} mobile></bth-menu-ferramenta-icone>
        <span slot="menu_descricao_mobile" class="descricao-mobile">Novidades</span>

        <bth-menu-ferramenta-icone slot="menu_item_desktop" icone="gift" contador={totalNaoLida}></bth-menu-ferramenta-icone>

        <section slot="conteudo_painel_lateral">

          {!this.isApiIndisponivel && (
            <bth-navbar-pill-group descricao="Novidades">
              {this.filtros.map(filtro => (
                <bth-navbar-pill-item
                  key={filtro.id.toString()}
                  identificador={filtro.id.toString()}
                  icone={filtro.icone}
                  descricao={filtro.descricao}
                  ativo={filtro.ativo}
                  totalizador={filtro.id === FiltroNovidade.NaoLida ? totalNaoLida : totalLida}
                  showTotalizador={!this.isBuscandoNovidades}>
                </bth-navbar-pill-item>
              ))}
            </bth-navbar-pill-group>
          )}

          {totalNaoLida !== 0 && this.isFiltroPorNaoLidas() && (
            <div class="marcar-todas">
              <a href="" onClick={this.onClickMarcarTodasComoLidas}>Marcar todas como lidas</a>
            </div>
          )}

          <div class="painel-novidades">

            {this.isEmptyStateVisible() && !this.isBuscandoNovidades && (
              <section class="empty-state-container">
                <div class="sem-registros"></div>
                <h4>Não há novidades por aqui</h4>
              </section>
            )}

            {this.isApiIndisponivel && !this.isBuscandoNovidades && (
              <section class="empty-state-container">
                <div class="indisponivel"></div>
                <h4>As novidades estão temporariamente indisponíveis</h4>
              </section>
            )}

            {!this.isApiIndisponivel && (
              <ul class="lista">
                {this.isFiltroPorLidas() && (
                  this.novidades.map(novidade => {
                    if (this.novidadesService.isLida(novidade.id)) {
                      return (
                        <li key={novidade.id}>
                          <bth-novidade-item
                            identificador={novidade.id}
                            titulo={novidade.titulo}
                            mensagem={novidade.mensagem}
                            url={novidade.url}
                            dataHora={novidade.dataInicial}
                            isLida={true}>
                          </bth-novidade-item>
                        </li>
                      );
                    }
                  })
                )}

                {this.isFiltroPorNaoLidas() && (
                  this.novidades.map(novidade => {
                    if (!this.novidadesService.isLida(novidade.id)) {
                      return (
                        <li key={novidade.id}>
                          <bth-novidade-item
                            identificador={novidade.id}
                            titulo={novidade.titulo}
                            mensagem={novidade.mensagem}
                            url={novidade.url}
                            dataHora={novidade.dataInicial}
                            isLida={false}>
                          </bth-novidade-item>
                        </li>
                      );
                    }
                  })
                )}
              </ul>
            )}

            {this.renderLoader()}

          </div>

        </section>
      </bth-menu-ferramenta>
    );
  }

}
