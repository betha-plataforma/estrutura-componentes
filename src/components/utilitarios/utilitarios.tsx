import { Component, h, Element, Prop, State, Watch, ComponentInterface, Event, EventEmitter } from '@stencil/core';

import { isValidAuthorizationConfig } from '../../global/api';
import { MSG_SEM_PERMISSAO_RECURSO } from '../../global/constants';
import { AuthorizationConfig } from '../../global/interfaces';
import { isNill } from '../../utils/functions';
import { Utilitario, OpcaoUtilitarioSelecionadaEvent } from './utilitarios.interfaces';
import { UtilitariosService } from './utilitarios.service';

@Component({
  tag: 'bth-utilitarios',
  styleUrl: 'utilitarios.scss',
  shadow: true
})
export class Utilitarios implements ComponentInterface {

  @Element() el!: HTMLBthUtilitariosElement;

  /**
   * Utilitários definidos pelo próprio sistema. São sempre exibidos,
   * independente da busca central.
   */
  @Prop() readonly utilitarios: Array<Utilitario>;

  /**
   * Habilita a busca dos utilitários centrais (api-utilitarios) visíveis ao
   * usuário, concatenando-os aos definidos pelo sistema. Desligada por padrão:
   * sem ela o componente apenas renderiza `utilitarios` (comportamento legado).
   */
  @Prop() readonly buscarUtilitarios: boolean = false;

  /**
   * Configuração de autorização. Obrigatória quando `buscarUtilitarios`
   * está habilitada (a api-utilitarios filtra a visibilidade pela identidade do
   * token + User-Access).
   */
  @Prop() readonly authorization?: AuthorizationConfig;

  /**
   * Override do host da api-utilitarios. Por padrão é resolvido por ambiente
   * (test, prod) a partir do `variaveis.js` da aplicação
   * (`___bth.envs.suite.utilitarios.v1.host`).
   */
  @Prop() readonly utilitariosHost?: string;

  /**
   * É emitido quando algum utilitário for selecionado
   */
  @Event() opcaoUtilitarioSelecionada: EventEmitter<OpcaoUtilitarioSelecionadaEvent>;

  @State() private utilitariosCentrais: Array<Utilitario> = [];

  @Watch('authorization')
  @Watch('buscarUtilitarios')
  @Watch('utilitariosHost')
  watchConfiguracao() {
    return this.carregarUtilitariosCentrais();
  }

  componentWillLoad() {
    return this.carregarUtilitariosCentrais();
  }

  private async carregarUtilitariosCentrais(): Promise<void> {
    if (!this.buscarUtilitarios || this.isConfiguracaoApiInconsistente()) {
      this.utilitariosCentrais = [];
      return;
    }

    try {
      const service = new UtilitariosService(this.authorization, this.getUtilitariosHost());
      this.utilitariosCentrais = await service.listar();
    } catch {
      this.utilitariosCentrais = [];
      console.warn('[bth-utilitarios] Não foi possível carregar os utilitários centrais; exibindo apenas os do sistema.');
    }
  }

  private getUtilitariosHost(): string {
    if (!isNill(this.utilitariosHost)) {
      return this.utilitariosHost;
    }

    if ('___bth' in window) {
      return window['___bth']?.envs?.suite?.['utilitarios']?.v1?.host;
    }

    return null;
  }

  private isConfiguracaoApiInconsistente(): boolean {
    return isNill(this.getUtilitariosHost()) || !isValidAuthorizationConfig(this.authorization);
  }

  private getUtilitariosExibidos(): Array<Utilitario> {
    const doSistema = this.utilitarios || [];
    const rotasDoSistema = new Set(doSistema.map(utilitario => utilitario.rota));
    const centraisNaoDuplicados = this.utilitariosCentrais
      .filter(utilitario => !rotasDoSistema.has(utilitario.rota));

    return [...doSistema, ...centraisNaoDuplicados];
  }

  private onClick = (event: UIEvent, utilitario: Utilitario) => {
    event.preventDefault();

    if (!utilitario.possuiPermissao) {
      return;
    }

    const eventPayload: OpcaoUtilitarioSelecionadaEvent = {
      nome: utilitario.nome,
      icone: utilitario.icone,
      rota: utilitario.rota
    };

    this.opcaoUtilitarioSelecionada.emit(eventPayload);
  }

  render() {
    const utilitarios = this.getUtilitariosExibidos();

    return (
      <bth-menu-ferramenta descricao="Utilitários" tituloPainelLateral="Utilitários">

        <bth-menu-ferramenta-icone slot="menu_item_desktop" icone="view-grid"></bth-menu-ferramenta-icone>

        <bth-menu-ferramenta-icone slot="menu_item_mobile" icone="view-grid" mobile></bth-menu-ferramenta-icone>
        <span slot="menu_descricao_mobile" class="descricao-mobile">Utilitários</span>

        <div slot="conteudo_painel_lateral" class="painel-utilitarios">
          {utilitarios.length > 0 && (
            <ul>
              {utilitarios.map((utilitario, index) => {
                return (
                  <li key={index} id={`utilitario_item_${index}`} >
                    <button
                      onClick={(event) => this.onClick(event, utilitario)}
                      class={`
                          bth__card
                          ${utilitario.possuiPermissao ? 'bth__card--clickable' : 'bth__card--disabled'}
                        `}
                      title={utilitario.possuiPermissao ? utilitario.nome : MSG_SEM_PERMISSAO_RECURSO}
                      aria-label={`Acessar o utilitário ${utilitario.nome}`}
                      aria-disabled={`${!utilitario.possuiPermissao}`}
                      disabled={!utilitario.possuiPermissao}>

                      <bth-icone icone={utilitario.icone} title={utilitario.nome}></bth-icone>

                      <span class="descricao twoline-ellipsis">{utilitario.nome}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </bth-menu-ferramenta>
    );
  }
}
