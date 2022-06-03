import { Component, h, Prop, ComponentInterface, State, Watch, Method } from '@stencil/core';

import { isNill } from '../../utils/functions';
import { BlipChatUserInfo } from './suporte.interfaces';

/**
 * Componente do menu Suporte com Blip Chat
 *
 * @see https://gitlab.services.betha.cloud/ped/tecnologia/nlp/blip-webchat-loader
 * @see https://gitlab.services.betha.cloud/ped/suite/atendimento/components/suite-atendimento
 */
@Component({
  tag: 'bth-suporte',
  styleUrl: 'suporte.scss',
  shadow: true,
})
export class Suporte implements ComponentInterface {

  /**
   * Habilita ou desabilita o Blip Chat
   */
  @Prop() readonly blipChat: boolean = false;

  /**
   * Usuário de sessão do Blip Chat
   */
  @Prop() readonly blipChatUserInfo: BlipChatUserInfo;

  /**
   * Usar estilos que este componente fornece
   */
  @Prop() readonly blipChatCustomStyle: boolean = false;

  /**
   * Cor do botão flutuante do Blip Chat
   */
  @Prop() readonly blipChatFabButtonColor: string;

  /**
   * Indica se a aplicação já possui botão flutuante
   */
  @Prop() readonly fabButton: boolean = false;

  /**
   * URL para a home da central de ajuda. Por padrão irá obter do env.js
   */
  @Prop() readonly centralAjudaHome?: string;

  @State() blipChatCounter: number = 0;
  @State() blipChatStatus: 'online' | 'offline' | undefined;

  @Watch('blipChatUserInfo')
  async watchBlipChatUserInfo() {
    await this.loadBlipChat();
  }

  /**
   * Carrega o Blip Chat
   */
  @Method()
  async loadBlipChat(): Promise<void> {
    if (this.blipChat && !isNill(this.blipChatUserInfo)) {
      this.initBlipChat();
      this.checkBlipChat();
    }
  }

  /**
   * Método para testar recebimento de uma mensagem do window para definir o badge de mensagens não vistas,
   * através de um evento do tipo 'BLIP_WEBCHAT_NOTIFICATION' emitido pelo loader do Blip Chat
   * @see https://gitlab.services.betha.cloud/ped/tecnologia/nlp/blip-webchat-loader
   */
  @Method()
  async handleWindowMessage(data: any): Promise<void> {
    if (this.blipChat && !isNill(this.blipChatUserInfo)) {
      this.handleBlipChatEvents({ data: JSON.stringify(data) });
    }
  }

  componentWillLoad(): Promise<void> | void {
    if (this.blipChat) {
      this.loadBlipChat();
      window.setInterval(() => this.checkBlipChat(), 2 * 60 * 1000);
    }
  }

  render() {
    return (
      <bth-menu-ferramenta descricao="Suporte" tituloPainelLateral="Suporte">
        <bth-menu-ferramenta-icone slot="menu_item_desktop" icone="headset" contador={this.blipChatCounter} status={this.blipChatStatus}></bth-menu-ferramenta-icone>
        <span slot="menu_descricao_desktop" class="descricao-desktop">Suporte</span>

        <bth-menu-ferramenta-icone slot="menu_item_mobile" icone="headset" mobile contador={this.blipChatCounter}></bth-menu-ferramenta-icone>
        <span slot="menu_descricao_mobile" class="descricao-mobile">Suporte</span>

        <div slot="conteudo_painel_lateral" class="suporte">
          <ul>
            { this.blipChat && (<li>
              <a onClick={(event) => this.onSuporteViaChatClick(event)}
                title="Suporte via chat"
                aria-label="Acessar o chat do suporte"
                aria-disabled="false">
                <div class="chat-status">
                  <bth-icone icone="message-outline" title="Chat"></bth-icone>
                  { this.blipChatStatus == 'online' && this.blipChatCounter == 0
                  && (<span class="badge status status--success">Online</span>)}
                  { this.blipChatCounter > 0
                  && (<span class="badge status status--danger">Novas mensagens</span>) }
                </div>
                <span>Suporte via chat</span>
              </a>
            </li>)}
            <li>
              <a href={this.getCentralAjudaHome()} target="_blank" rel="noreferrer" title="Central de ajuda"
                aria-label="Acessar a Central de ajuda"
                aria-disabled="false">
                <bth-icone icone="help-circle-outline" title="Chat"></bth-icone>
                <span>Central de ajuda</span>
              </a>
            </li>
          </ul>
        </div>
      </bth-menu-ferramenta>
    );
  }

  private getCentralAjudaHome(): string {
    if (!isNill(this.centralAjudaHome)) {
      return this.centralAjudaHome;
    }

    if ('___bth' in window) {
      return window['___bth'].envs.suite['central-de-ajuda'].v1['host-redirecionamento'];
    }

    return null;
  }

  private onSuporteViaChatClick = async (event: UIEvent) => {
    event.preventDefault();
    if (!this.blipChat) {
      return;
    }
    const blipChatElement = document.querySelector('#blip-chat-open-iframe') as HTMLIFrameElement;
    if (!isNill(blipChatElement)) {
      blipChatElement.click();
    }
  }

  private initBlipChat = () => {
    this.setupBlipChat(this.blipChatUserInfo);
    window.addEventListener('message', this.handleBlipChatEvents);
  }

  private checkBlipChat() {
    this.blipChatStatus = this.isBlipChatOnline() ? 'online' : 'offline';
  }

  private setupBlipChat = (blipChatUserInfo: BlipChatUserInfo) => {
    this.setupBlipChatScript(blipChatUserInfo);
    if (this.blipChatCustomStyle) {
      this.setupBlipChatStyles();
    }
  }

  private setupBlipChatScript = (blipChatUserInfo: BlipChatUserInfo) => {
    const script = document.createElement('script');
    script.src = 'https://resources.tecnologia.betha.cloud/blip-webchat/1.1/loader.js';
    if (!isNill(this.blipChatFabButtonColor)) {
      script.setAttribute('custom-color', this.blipChatFabButtonColor);
    }
    document.head.appendChild(script);
    const userInfo = {
      id: blipChatUserInfo.id,
      nome: blipChatUserInfo.nome,
      emails: {
        primario: blipChatUserInfo.email
      }
    };
    script.onload = () => window.postMessage(JSON.stringify({ event: 'BLIP_WEBCHAT', userInfo }), '*');
  }

  private setupBlipChatStyles = () => {
    const style = document.createElement('style');
    const textCss = document.createTextNode(`
      #blip-chat-container #blip-chat-open-iframe {
        max-width: 50px !important;
        min-width: 50px !important;
        max-height: 50px !important;
        min-height: 50px !important;
        right: 14px !important;
        box-shadow: 0 3px 6px rgb(0 0 0 / 16%), 0 3px 6px rgb(0 0 0 / 23%);
        ${ this.fabButton ? 'bottom: 75px !important;' : '' }
      }
      #blip-chat-container #blip-chat-iframe {
        ${ this.fabButton ? 'bottom: 135px !important;' : 'bottom: 99px !important;' }
      }
      @media screen and (min-width: 1024px) {
        #blip-chat-container #blip-chat-iframe.blip-chat-iframe-opened {
          height: 480px !important;
          width: 380px !important;
        }
      }
      @media screen and (min-width: 768px) {
        #blip-chat-container #blip-chat-iframe {
          right: 14px !important;
        }
      }
    `);
    style.setAttribute('type', 'text/css');
    style.appendChild(textCss);
    document.head.appendChild(style);
  }

  private handleBlipChatEvents = (event) => {
    if (!event.data || typeof event.data !== 'string' || !event.data.startsWith('{')) {
      return;
    }
    try {
      const data = JSON.parse(event.data);
      const eventName = data.event;

      if (eventName && eventName === 'BLIP_WEBCHAT_NOTIFICATION') {
        const { pendingMessages } = data;
        this.blipChatCounter = pendingMessages;
      }
    } catch (err) {
      console.error(err);
    }
  }

  private isBlipChatOnline = () => {
    if (this.blipChat) {
      const now = Date.now() - (3 * 60 * 60 * 1000);
      const hours = Math.floor((now / (60 * 60 * 1000)) % 24);
      const minutes = Math.floor((now / (60 * 1000)) % 60);
      if (this.isBetween8h30mAnd12h(hours, minutes) || this.isBetween13h30mAnd18h(hours, minutes)) {
        return true;
      }
    }
    return false;
  }

  private isBetween8h30mAnd12h = (hours, minutes) => (((hours == 8 && minutes >= 30) || (hours >= 9)) && hours <= 11);
  private isBetween13h30mAnd18h = (hours, minutes) => (((hours == 13 && minutes >= 30) || (hours >= 14)) && hours <= 17);

}
