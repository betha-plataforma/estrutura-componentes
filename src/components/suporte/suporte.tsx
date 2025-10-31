import {
  Component,
  h,
  Prop,
  ComponentInterface,
  State,
  Watch,
  Method,
} from '@stencil/core';

import { AuthorizationConfig } from '../../global/interfaces';
import { isNill } from '../../utils/functions';
import { LicencasService } from './licencas.service';
import { BlipChatUserInfo, WebChatConfig } from './suporte.interfaces';

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

  /**
   * Habilita ou desabilita o botão de abrir um chamado no atendimento
   */
  @Prop() readonly atendimento: boolean = false;

  /**
   * Configuração de autorização. É necessária para o componente poder autenticar com os serviços.
   */
  @Prop() readonly authorization: AuthorizationConfig;

  /**
   * Configuração de suporte via webchat.
   */
  @Prop() readonly webChatConfig: WebChatConfig;

  /**
   * URL para a api de licenças. Por padrão irá obter do env.js.
   */
  @Prop() readonly licencasApi?: string;

  /**
   * Habilita ou desabilita o Blip Chat
   */
  @State() blipChat: boolean = false;
  @State() blipChatCounter: number = 0;
  @State() blipChatStatus: 'online' | 'offline' | undefined;

  private _checkInterval: number = null;

  @Watch('blipChatUserInfo')
  async watchBlipChatUserInfo() {
    await this.loadBlipChat();
  }

  @Watch('webChatConfig')
  async watchWebChatConfig() {
    this.blipChat = this.webChatConfig.habilitado;
    this.loadBlipChat();
  }

  @Watch('blipChatStatus')
  async watchWebChatStatus() {
    window.postMessage(
      JSON.stringify({
        event: 'BLIP_WEBCHAT_STATUS',
        status: this.blipChatStatus,
      }),
      '*'
    );
  }

  /**
   * Carrega o Blip Chat
   */
  @Method()
  async loadBlipChat(): Promise<void> {
    if (
      this.blipChat &&
      !isNill(this.blipChatUserInfo) &&
      !isNill(this.webChatConfig)
    ) {
      this.initBlipChat();

      if (!isNill(this._checkInterval)) {
        return;
      }

      this._checkInterval = window.setInterval(
        () => this.checkBlipChat(),
        30 * 1000
      );
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
    this.loadBlipChat();
  }

  render() {
    return (
      <bth-menu-ferramenta descricao="Suporte" tituloPainelLateral="Suporte">
        <bth-menu-ferramenta-icone
          slot="menu_item_desktop"
          icone="headset"
          contador={this.blipChatCounter}
          status={this.blipChatStatus}
        ></bth-menu-ferramenta-icone>
        <span slot="menu_descricao_desktop" class="descricao-desktop">
          Suporte
        </span>

        <bth-menu-ferramenta-icone
          slot="menu_item_mobile"
          icone="headset"
          mobile
          contador={this.blipChatCounter}
        ></bth-menu-ferramenta-icone>
        <span slot="menu_descricao_mobile" class="descricao-mobile">
          Suporte
        </span>

        <div slot="conteudo_painel_lateral" class="suporte">
          <ul>
            {this.blipChat && (
              <li>
                <a
                  class="bth__card bth__card--clickable"
                  onClick={this.onSuporteViaChatClick}
                  title="Suporte via chat"
                  aria-label="Acessar o chat do suporte"
                  aria-disabled="false"
                >
                  <div class="chat-status">
                    <bth-icone icone="message-outline" title="Chat"></bth-icone>
                    {this.blipChatStatus == 'online' &&
                      this.blipChatCounter == 0 && (
                        <span class="badge status status--success">Online</span>
                      )}
                    {this.blipChatCounter > 0 && (
                      <span class="badge status status--danger">
                        Novas mensagens
                      </span>
                    )}
                  </div>
                  <span class="descricao twoline-ellipsis">
                    Suporte via chat
                  </span>
                </a>
              </li>
            )}
            <li>
              <a
                class="bth__card bth__card--clickable"
                href={this.getCentralAjudaHome()}
                target="_blank"
                rel="noreferrer"
                title="Central de ajuda"
                aria-label="Acessar a Central de ajuda"
                aria-disabled="false"
              >
                <bth-icone icone="help-circle-outline" title="Chat"></bth-icone>
                <span class="descricao twoline-ellipsis">Central de ajuda</span>
              </a>
            </li>
            {this.atendimento && (
              <li>
                <a
                  class="bth__card bth__card--clickable"
                  onClick={this.onAtendimentoClick}
                  title="Abrir um chamado"
                  aria-label="Abrir um chamado"
                  aria-disabled="false"
                >
                  <bth-icone icone="plus-thick" title="Plus"></bth-icone>
                  <span class="descricao twoline-ellipsis">
                    Abrir um chamado
                  </span>
                </a>
              </li>
            )}
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
      return window['___bth'].envs.suite['central-de-ajuda'].v1[
        'host-redirecionamento'
      ];
    }

    return null;
  }

  private onSuporteViaChatClick = async (event: UIEvent) => {
    event.preventDefault();
    if (!this.blipChat) {
      return;
    }
    const blipChatElement = document.querySelector(
      '#blip-chat-open-iframe'
    ) as HTMLIFrameElement;
    if (!isNill(blipChatElement)) {
      blipChatElement.click();
    }
  };

  private initBlipChat = () => {
    this.setupBlipChat(this.blipChatUserInfo);
    window.addEventListener('message', this.handleBlipChatEvents);
  };

  private checkBlipChat() {
    this.blipChatStatus = this.isBlipChatOnline() ? 'online' : 'offline';
  }

  private setupBlipChat = (blipChatUserInfo: BlipChatUserInfo) => {
    this.setupBlipChatScript(blipChatUserInfo);
    if (this.blipChatCustomStyle) {
      this.setupBlipChatStyles();
    }
  };

  private setupBlipChatScript = (blipChatUserInfo: BlipChatUserInfo) => {
    const script = document.createElement('script');
    script.src =
      'https://resources.tecnologia.betha.cloud/blip-webchat/latest/loader.js';
    if (!isNill(this.blipChatFabButtonColor)) {
      script.setAttribute('custom-color', this.blipChatFabButtonColor);
    }
    document.head.appendChild(script);
    const userInfo = {
      id: blipChatUserInfo.id,
      nome: blipChatUserInfo.nome,
      emails: {
        primario: blipChatUserInfo.email,
      },
    };
    script.onload = () => {
      window.postMessage(
        JSON.stringify({ event: 'BLIP_WEBCHAT', userInfo }),
        '*'
      );
      window.postMessage(
        JSON.stringify({
          event: 'BLIP_WEBCHAT_EXTRAS',
          extras: this.webChatConfig,
        }),
        '*'
      );

      this.checkBlipChat();
    };
  };

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
        ${this.fabButton ? 'bottom: 75px !important;' : ''}
      }
      #blip-chat-container #blip-chat-iframe {
        ${
          this.fabButton
            ? 'bottom: 135px !important;'
            : 'bottom: 99px !important;'
        }
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
  };

  private handleBlipChatEvents = (event) => {
    if (
      !event.data ||
      typeof event.data !== 'string' ||
      !event.data.startsWith('{')
    ) {
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
  };

  private isBetween = (start: number, end: number, now: number) =>
    start <= end ? now >= start && now < end : now >= start || now < end;

  private isBlipChatOnline = () => {
    if (this.blipChat && !isNill(this.webChatConfig)) {
      const nowInterval = this.nowIntervalInMinutes();
      const attendanceIntervals = this.attendanceIntervalsInMinutes();
      return attendanceIntervals.some(({ start, end }) =>
        this.isBetween(start, end, nowInterval)
      );
    }

    return false;
  };

  private toMinutes = (hms: string) => {
    const [h, m] = hms.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  private nowIntervalInMinutes = () => {
    const p = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date());

    const h = Number(p.find((x) => x.type === 'hour')?.value ?? 0);
    const m = Number(p.find((x) => x.type === 'minute')?.value ?? 0);
    return h * 60 + m;
  };

  private attendanceIntervalsInMinutes = () => {
    return Object.values(this.webChatConfig)
      .filter(
        (valueObject) =>
          !!valueObject &&
          typeof valueObject === 'object' &&
          typeof (valueObject as any).start === 'string' &&
          typeof (valueObject as any).end === 'string'
      )
      .map((value) => ({
        start: this.toMinutes(value.start),
        end: this.toMinutes(value.end),
      }));
  };

  private onAtendimentoClick = async (event: UIEvent) => {
    event.preventDefault();
    if (!this.atendimento) {
      return;
    }
    if (isNill(this.getLicencasApi()) || this.authorization === undefined) {
      console.warn(
        '[bth-suporte] O endereço do serviço de licenças e as credenciais de autenticação devem ser informados. Consulte a documentação do componente.'
      );
      return;
    }
    const licencasService = new LicencasService(
      this.authorization,
      this.getLicencasApi()
    );
    licencasService.carregarAtendimento().then((atendimento) => {
      if (atendimento) {
        window.open(atendimento.novo, '_blank');
      }
    });
  };

  private getLicencasApi(): string {
    if (!isNill(this.licencasApi)) {
      return this.licencasApi;
    }

    if ('___bth' in window) {
      return window['___bth'].envs.suite['licenses'].v1.host;
    }

    return null;
  }
}
