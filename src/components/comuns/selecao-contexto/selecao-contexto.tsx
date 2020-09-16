import { Component, Host, State, Element, h, Prop, Watch, Listen, ComponentInterface } from '@stencil/core';

import { isNill } from '../../../utils/functions';
import { PromiseTracker } from '../../../utils/promise-tracker';
import { ItemSelecaoContexto } from './selecao-contexto.interfaces';

/**
 * Este componente permite compor uma lista de seleção de contexto.
 *
 * @slot sem_resultado - Permite customizar a área de sem resultados
 * @slot cabecalho - Permite customizar o cabecalho
 * @slot rodape - Permite customizar o rodape
 */
@Component({
  tag: 'bth-selecao-contexto',
  styleUrl: 'selecao-contexto.scss',
  shadow: true
})
export class SelecaoContexto implements ComponentInterface {

  private tracker = new PromiseTracker((active: boolean) => {
    this.isBuscandoItens = active;
  });

  @Element() el!: HTMLBthSelecaoContextoElement;

  /**
   * Placeholder para o input de pesquisa
   */
  @Prop() readonly placeholderPesquisa?: string;

  /**
   * Método para buscar os itens de seleção
   */
  @Prop() readonly buscar: () => Promise<ItemSelecaoContexto[]>;

  /**
   * Método executado ao selecionar algum item da lista
   */
  @Prop() readonly selecionar: (item: ItemSelecaoContexto) => Promise<any> | void;

  @State() isBuscandoItens: boolean;
  @State() itens: ItemSelecaoContexto[] = [];
  @State() itensFiltrados: ItemSelecaoContexto[] = [];

  @State() termoPesquisa: string;

  @State() possuiSlotSemResultadoDeclarado: boolean = false;

  connectedCallback() {
    this.configurarPresencaSemResultado();
    this.buscarItens();
  }

  componentDidRender() {
    if (!this.isBuscandoItens) {
      this.setInputFocus();
    }
  }

  @Listen('keydown')
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      this.handleArrowUp();
    } else if (event.key === 'ArrowDown') {
      this.handleArrowDown(event);
    }
  }

  /**
   * Define a configuração do componente
   *
   * @param configuracao Configuração do componente
   */
  @Watch('buscar')
  async watchBuscar() {
    this.buscarItens();
  }

  private async setInputFocus() {
    const input = this.el.shadowRoot.querySelector('input');

    if (isNill(input)) {
      return;
    }

    input.focus();
  }

  private buscarItens = async () => {
    if (isNill(this.buscar)) {
      return;
    }

    const promise: Promise<any> = this.buscar()
      .then((itens) => {
        this.itens = [...itens];
        this.itensFiltrados = [...itens];
      });

    this.tracker.addPromise(promise);
  }

  private configurarPresencaSemResultado(): void {
    this.possuiSlotSemResultadoDeclarado = this.el.querySelector('[slot="sem_resultado"]') !== null;
  }

  private onSelecionar = (event: UIEvent, item: ItemSelecaoContexto): void => {
    event.preventDefault();
    this.selecionar(item);
  }

  private onInputSearch = (event: UIEvent): void => {
    this.termoPesquisa = (event.target as HTMLInputElement).value;

    this.itensFiltrados = this.itens
      .filter(item => item.descricao && item.descricao.toUpperCase().includes(this.termoPesquisa.toUpperCase()));
  }

  private possuiImagemAvatar = (item: ItemSelecaoContexto): boolean => {
    return item.imagemAvatar !== undefined;
  }

  private possuiIcone = (item: ItemSelecaoContexto): boolean => {
    return item.icone !== undefined;
  }

  private getTipoEmptyState = (): any => {
    if (this.possuiSlotSemResultadoDeclarado) {
      return null;
    }

    if (this.termoPesquisa !== undefined && this.termoPesquisa.length > 0) {
      return { registrosPesquisa: true };
    }

    return { registros: true };
  }

  private isElementLink = (element: Element) => element.tagName === 'A';

  private isElementInput = (element: Element) => element.tagName === 'INPUT';

  private handleArrowDown(event: KeyboardEvent) {
    const activeElement = this.el.shadowRoot.activeElement;

    if (this.isElementInput(activeElement)) {

      // Evita que o primeiro scroll do container cubra o primeiro item selecionado
      event.preventDefault();

      const listElement = this.el.shadowRoot.querySelector('ul');

      if (!isNill(listElement.firstElementChild)) {
        this.setFocusListItem(listElement.firstElementChild as HTMLElement);
      }
    }

    if (this.isElementLink(activeElement)) {
      if (isNill(activeElement.parentNode)) {
        return;
      }

      const nextSibling = activeElement.parentNode.nextSibling as HTMLElement;

      this.setFocusListItem(nextSibling);
    }
  }

  private handleArrowUp() {
    const activeElement = this.el.shadowRoot.activeElement;

    if (activeElement.getAttribute('tabindex') === '1') {
      this.el.shadowRoot.querySelector('input').focus();
    }

    if (this.isElementLink(activeElement)) {
      if (isNill(activeElement.parentNode)) {
        return;
      }

      const previousListItem = activeElement.parentNode.previousSibling as HTMLElement;

      this.setFocusListItem(previousListItem);
    }
  }

  private setFocusListItem(listItem: HTMLElement) {
    if (isNill(listItem)) {
      return;
    }

    const listItemFocusableElement = listItem.querySelector('a');

    if (isNill(listItemFocusableElement)) {
      return;
    }

    listItemFocusableElement.focus();
  }

  render() {
    return (
      <Host>
        <section class="selecao-contexto">

          {!this.isBuscandoItens && (<slot name="cabecalho"></slot>)}

          {!this.isBuscandoItens && (
            <div class="selecao-contexto__search">
              <input
                type="text"
                class="form-control"
                placeholder={this.placeholderPesquisa ?? 'Digite os termos para pesquisar'}
                tabindex="1"
                value={this.termoPesquisa}
                onInput={this.onInputSearch}
                disabled={this.isBuscandoItens}
                aria-label="Digite os termos para pesquisar" />
            </div>
          )}

          <bth-empty-state {...this.getTipoEmptyState()} show={!this.isBuscandoItens && this.itensFiltrados.length <= 0}>
            {this.possuiSlotSemResultadoDeclarado && (<slot name="sem_resultado" />)}
          </bth-empty-state>

          <div class="selecao-contexto__body">
            {this.isBuscandoItens && (
              <div class="selecao-contexto__body--loader">
                <bth-loader></bth-loader>
              </div>
            )}

            {!this.isBuscandoItens && (
              <ul id="lista-contexto">
                {this.itensFiltrados.map((item, index) => (
                  <li key={item.id} onClick={event => this.onSelecionar(event, item)}>
                    <a href="" tabindex={index + 1}>
                      {this.possuiImagemAvatar(item) && (
                        <bth-avatar
                          src={item.imagemAvatar}
                          title={item.descricao}
                          subIcone={item.iconeStatus}
                          subIconeTitle={item.iconeStatusTitle}>
                        </bth-avatar>
                      )}

                      {this.possuiIcone(item) && (
                        <bth-avatar
                          icone={item.icone}
                          title={item.descricao}
                          subIcone={item.iconeStatus}
                          subIconeTitle={item.iconeStatusTitle}>
                        </bth-avatar>
                      )}

                      {!this.possuiImagemAvatar(item) && !this.possuiIcone(item) && (
                        <bth-avatar
                          iniciais={item.descricao}
                          title={item.descricao}
                          subIcone={item.iconeStatus}
                          subIconeTitle={item.iconeStatusTitle}>
                        </bth-avatar>
                      )}

                      <section>
                        <h4 title={item.descricao}>{item.descricao}</h4>
                        <p title={item.complemento}>{item.complemento}</p>
                      </section>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!this.isBuscandoItens && (
            <footer>
              <slot name="rodape"></slot>
            </footer>
          )}

        </section>
      </Host>
    );
  }

}
