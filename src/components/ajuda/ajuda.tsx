import { Component, h, Prop, ComponentInterface } from '@stencil/core';

import { isNill } from '../../utils/functions';

@Component({
  tag: 'bth-ajuda',
  styleUrl: 'ajuda.scss',
  shadow: true,
})
export class Ajuda implements ComponentInterface {

  /**
   * URL para a home da central de ajuda. Por padrão irá obter do env.js
   */
  @Prop() readonly centralAjudaHome?: string;

  private getCentralAjudaHome(): string {
    if (!isNill(this.centralAjudaHome)) {
      return this.centralAjudaHome;
    }

    if ('___bth' in window) {
      return window['___bth'].envs.suite['central-de-ajuda'].v1['host-redirecionamento'];
    }

    return null;
  }

  render() {
    return (
      <bth-menu-ferramenta descricao="Ajuda" tituloPainelLateral="Ajuda">
        <bth-menu-ferramenta-icone slot="menu_item_desktop" icone="help-circle"></bth-menu-ferramenta-icone>

        <bth-menu-ferramenta-icone slot="menu_item_mobile" icone="help-circle" mobile ></bth-menu-ferramenta-icone>
        <span slot="menu_descricao_mobile" class="descricao-mobile">Ajuda</span>

        <div slot="conteudo_painel_lateral" class="empty-ajuda">
          <div class="empty-ajuda__img"></div>
          <h4>
            Está com dúvida? Acesse a <a href={this.getCentralAjudaHome()} target="_blank" rel="noreferrer">Central de Ajuda <bth-icone icone="open-in-new"></bth-icone></a>
          </h4>
        </div>
      </bth-menu-ferramenta>
    );
  }
}
