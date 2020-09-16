import { Component, h, Element, Prop, ComponentInterface, Event, EventEmitter } from '@stencil/core';

import { MSG_SEM_PERMISSAO_RECURSO } from '../../global/constants';
import { Utilitario, OpcaoUtilitarioSelecionadaEvent } from './utilitarios.interfaces';

@Component({
  tag: 'bth-utilitarios',
  styleUrl: 'utilitarios.scss',
  shadow: true
})
export class Utilitarios implements ComponentInterface {

  @Element() el!: HTMLBthUtilitariosElement;

  /**
   * Utilitarios
   */
  @Prop() readonly utilitarios: Array<Utilitario>;

  /**
   * É emitido quando algum utilitário for selecionado
   */
  @Event() opcaoUtilitarioSelecionada: EventEmitter<OpcaoUtilitarioSelecionadaEvent>;

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
    return (
      <bth-menu-ferramenta descricao="Utilitários" tituloPainelLateral="Utilitários">

        <bth-menu-ferramenta-icone slot="menu_item_desktop" icone="view-grid"></bth-menu-ferramenta-icone>

        <bth-menu-ferramenta-icone slot="menu_item_mobile" icone="view-grid" mobile></bth-menu-ferramenta-icone>
        <span slot="menu_descricao_mobile" class="descricao-mobile">Utilitários</span>

        <div slot="conteudo_painel_lateral" class="painel-utilitarios">
          {this.utilitarios && (
            <ul>
              {this.utilitarios.map((utilitario, index) => {
                return (
                  <li key={index} id={`utilitario_item_${index}`} >
                    <button
                      onClick={(event) => this.onClick(event, utilitario)}
                      class={`
                          painel-utilitarios__card
                          painel-utilitarios__card--bordered block-ellipsis
                          ${utilitario.possuiPermissao ? 'painel-utilitarios__card--clickable' : 'painel-utilitarios__card--disabled'}
                        `}
                      title={utilitario.possuiPermissao ? utilitario.nome : MSG_SEM_PERMISSAO_RECURSO}
                      aria-label={`Acessar o utilitário ${utilitario.nome}`}
                      aria-disabled={`${!utilitario.possuiPermissao}`}
                      disabled={!utilitario.possuiPermissao}>

                      <bth-icone icone={utilitario.icone} title={utilitario.nome}></bth-icone>

                      <span class="descricao block-ellipsis">{utilitario.nome}</span>
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
