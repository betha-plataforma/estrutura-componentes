import { Component, h, Element, Prop, State, Watch, ComponentInterface, Event, EventEmitter } from '@stencil/core';

import { isValidAuthorizationConfig } from '../../global/api';
import { MSG_SEM_PERMISSAO_RECURSO } from '../../global/constants';
import { AuthorizationConfig } from '../../global/interfaces';
import { isNill } from '../../utils/functions';
import { Utilitario, UtilitarioCentral, OpcaoUtilitarioSelecionadaEvent } from './utilitarios.interfaces';
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

  @State() private utilitariosCentrais: Array<UtilitarioCentral> = [];

  private userAccessDosCentrais?: string;

  /**
   * Identifica a busca mais recente. Só ela aplica resultado ou erro: respostas de buscas
   * anteriores (troca de entidade, host ou flag) chegam fora de ordem e são descartadas.
   */
  private buscaAtual = 0;

  @Watch('authorization')
  @Watch('buscarUtilitarios')
  @Watch('utilitariosHost')
  watchConfiguracao() {
    return this.carregarUtilitariosCentrais();
  }

  componentWillLoad() {
    // Sem devolver a promise: o Stencil esperaria a api-utilitarios antes do primeiro render,
    // e o menu (inclusive os utilitários do sistema) só apareceria quando ela respondesse.
    this.carregarUtilitariosCentrais();
  }

  /** Devolve a lista aplicada por esta busca, ou vazia se ela foi superada por outra ou falhou. */
  private async carregarUtilitariosCentrais(): Promise<Array<UtilitarioCentral>> {
    const busca = ++this.buscaAtual;

    if (!this.buscarUtilitarios || this.isConfiguracaoApiInconsistente()) {
      this.utilitariosCentrais = [];
      return [];
    }

    try {
      const userAccess = this.authorization.getAuthorization().userAccess;
      const service = new UtilitariosService(this.authorization, this.getUtilitariosHost());
      const centrais = await service.listar();
      if (busca === this.buscaAtual) {
        this.utilitariosCentrais = centrais;
        this.userAccessDosCentrais = userAccess;
        return centrais;
      }
    } catch {
      if (busca === this.buscaAtual) {
        this.utilitariosCentrais = [];
        console.warn('[bth-utilitarios] Não foi possível carregar os utilitários centrais; exibindo apenas os do sistema.');
      }
    }
    return [];
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

  /**
   * A rota de um utilitário central leva o contexto (entidade e base) da busca que o
   * trouxe. Se o sistema trocou de contexto sem repassar `authorization`, busca de novo
   * e devolve o mesmo utilitário no contexto atual, ou nada se ele não estiver mais
   * disponível, a busca falhar ou for superada por outra.
   */
  private async noContextoAtual(utilitario: Utilitario): Promise<Utilitario | undefined> {
    const central = this.utilitariosCentrais.find(item => item === utilitario);
    if (isNill(central) || this.authorization.getAuthorization().userAccess === this.userAccessDosCentrais) {
      return utilitario;
    }

    const atuais = await this.carregarUtilitariosCentrais();
    return atuais.find(item => item.id === central.id);
  }

  private onClick = async (event: UIEvent, utilitario: Utilitario) => {
    event.preventDefault();

    if (!utilitario.possuiPermissao) {
      return;
    }

    const selecionado = await this.noContextoAtual(utilitario);
    if (isNill(selecionado) || !selecionado.possuiPermissao) {
      return;
    }

    const eventPayload: OpcaoUtilitarioSelecionadaEvent = {
      nome: selecionado.nome,
      icone: selecionado.icone,
      rota: selecionado.rota
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
