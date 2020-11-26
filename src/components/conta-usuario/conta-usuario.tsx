import { Component, State, h, Element, Prop, Watch, ComponentInterface, EventEmitter, Event } from '@stencil/core';

import { isNill, getCssVariableValue } from '../../utils/functions';
import { DEFAULT_AVATAR_URL } from './conta-usuario.constants';
import { LogoutEvent } from './conta-usuario.interfaces';

/**
 * Este componente exibe informações relacionadas ao usuário/conta logada
 *
 * Este componente foi elaborado para comportar o slot "menu_ferramentas"
 */
@Component({
  tag: 'bth-conta-usuario',
  styleUrl: 'conta-usuario.scss',
  shadow: true
})
export class ContaUsuario implements ComponentInterface {

  @Element() el!: HTMLBthContaUsuarioElement;

  @State() erroCarregarFotoAvatar: boolean = false;

  /**
   * URL para home da Central de Usuários. Por padrão irá obter do env.js.
   */
  @Prop() readonly centralUsuarioHome?: string

  /**
   * URL para foto de avatar do usuário
   */
  @Prop() readonly fotoUrl: string;

  /**
   * Nome do usuário
   */
  @Prop() readonly nome: string;

  /**
   * Usuário ("username" ou "email")
   */
  @Prop() readonly usuario: string;

  /**
   * É emitido ao clicar em Sair ("logout")
   */
  @Event() readonly logout: EventEmitter<LogoutEvent>;

  @Watch('fotoUrl')
  async watchFotoUrl() {
    this.erroCarregarFotoAvatar = false;
  }

  private getCentralUsuarioHome(): string {
    if (!isNill(this.centralUsuarioHome)) {
      return this.centralUsuarioHome;
    }

    if ('___bth' in window) {
      return window['___bth'].envs.suite['central-usuarios'].v1.host;
    }

    return null;
  }

  private onLogout = (event: UIEvent) => {
    event.preventDefault();

    this.logout.emit({ usuario: this.usuario, nome: this.nome });
  };

  private onImageLoadError = (): void => {
    this.erroCarregarFotoAvatar = true;
  }

  private getUrlImagemPerfil() {
    if (isNill(this.fotoUrl) || this.erroCarregarFotoAvatar) {
      return DEFAULT_AVATAR_URL;
    }

    return this.fotoUrl;
  }

  private renderMenuItemMobile() {
    return (
      <div slot="menu_item_mobile">
        <bth-avatar
          class="avatar-mobile"
          src={this.getUrlImagemPerfil()}
          title={`Foto de ${this.nome}`}
          dimensao={54}
          borda
          bordaTamanho="2px"
          bordaCor={getCssVariableValue('--bth-app-blue')}
          bordaRaio="50%"
          onImageLoadError={this.onImageLoadError}>
        </bth-avatar>

        <div class="avatar-mobile-badge">
          <bth-icone icone="cog"></bth-icone>
        </div>
      </div>
    );
  }

  private renderMenuDescricaoMobile() {
    return (
      <section slot="menu_descricao_mobile" class="perfil-usuario">
        <div>
          <span class="perfil-usuario__nome" title={this.nome}>{this.nome}</span>
          <span class="perfil-usuario__id" title={`@${this.usuario}`}>@{this.usuario}</span >
        </div>
      </section>
    );
  }

  private renderMenuItemDesktop() {
    return (
      <section slot="menu_item_desktop">
        <bth-avatar
          class="avatar-desktop"
          src={this.getUrlImagemPerfil()}
          title={`Foto de ${this.nome}`}
          tamanho="menor"
          borda
          bordaTamanho="2px"
          bordaCor={getCssVariableValue('--bth-app-gray-light-10')}
          bordaRaio="50%"
          onImageLoadError={this.onImageLoadError}
        ></bth-avatar>
      </section>
    );
  }

  private renderConteudoPainelLateral() {
    return (
      <section slot="conteudo_painel_lateral" class="painel-usuario">
        <div class="perfil-usuario">
          <bth-avatar
            src={this.getUrlImagemPerfil()}
            title={`Foto de ${this.nome}`}
            dimensao={120}
            borda
            bordaTamanho="2px"
            bordaCor={getCssVariableValue('--bth-app-blue')}
            bordaRaio="50%"
            onImageLoadError={this.onImageLoadError}>
          </bth-avatar>
          <div>
            <span class="perfil-usuario__nome" title={this.nome}>{this.nome}</span>
            <span class="perfil-usuario__id" title={`@${this.usuario}`}>@{this.usuario}</span >
          </div>
        </div>

        <ul>
          <li>
            <a href={this.getCentralUsuarioHome()} target="_blank" title="Editar" rel="noreferrer">
              <bth-icone icone="pencil"></bth-icone> Editar
            </a>
          </li>
          <li>
            <a href="" title="Sair" onClick={this.onLogout}>
              <bth-icone icone="login-variant"></bth-icone> Sair
            </a>
          </li>
        </ul>
      </section>
    );
  }

  render() {
    return (
      <bth-menu-ferramenta descricao="Conta do usuário">
        {this.renderMenuItemMobile()}
        {this.renderMenuDescricaoMobile()}
        {this.renderMenuItemDesktop()}
        {this.renderConteudoPainelLateral()}
      </bth-menu-ferramenta>
    );
  }
}
