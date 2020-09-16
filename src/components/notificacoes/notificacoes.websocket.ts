import { AuthorizationConfig } from '../../global/interfaces';
import { isNill } from '../../utils/functions';
import { MessageType } from './notificacoes.constants';
import { NotificacaoWebsocketMessage } from './notificacoes.interfaces';

// https://developer.mozilla.org/pt-BR/docs/Web/API/CloseEvent
const CODES_TO_RECONNECT = [1001, 1006];

const RETRY_TIMEOUT_IN_MS = 5000;

export class NotificationWebSocket {

  private webSocket: WebSocket;
  private sequence: number = 0;

  constructor(
    private authorization: AuthorizationConfig,
    private notificationsWs: string,
    private refreshTime: number = 0,
    private listeners = {},
    private closed: boolean = false) {

    this.webSocket = new WebSocket(this.getUrl());

    this.addEventListener('open', () => {
      this.refreshTime = 0;
    });

    this.addEventListener('open', () => {
      if (this.hasStarted()) {
        this.send({ type: MessageType.RESTARTED, sequence: this.sequence });
      } else {
        this.send({ type: MessageType.STARTED });
      }
    });

    this.addEventListener('message', (event: MessageEvent) => {
      if (/type/.test(event.data)) {
        const data = JSON.parse(event.data);
        this.sequence = data.sequence;
      }
    });

    this.addEventListener('close', async (event: CloseEvent) => {
      if (CODES_TO_RECONNECT.includes(event.code) && !this.closed) {

        await this.authorization.handleUnauthorizedAccess();

        const retryTime = this.refreshTime;
        this.refreshTime += RETRY_TIMEOUT_IN_MS;

        setTimeout(() => this.refresh(), retryTime);
      }
    });
  }

  addEventListener(listener: string, callback: Function): void {
    if (isNill(listener)) {
      return;
    }

    const callbackListener = function (event: Event) {
      callback(event);
    };

    this.listeners[listener] = this.listeners[listener] || [];
    this.listeners[listener].push(callbackListener);

    this.webSocket.addEventListener(listener, callbackListener);
  }

  send(message: NotificacaoWebsocketMessage): void {
    this.webSocket.send(JSON.stringify(message));
  }

  hasStarted(): boolean {
    return this.sequence > 0;
  }

  refresh(): void {
    this.webSocket = new WebSocket(this.getUrl());

    for (const listener in this.listeners) {
      if (Object.prototype.hasOwnProperty.call(this.listeners, listener)) {
        const listenerCallbacks = this.listeners[listener];

        listenerCallbacks.forEach(callback => {
          this.webSocket.addEventListener(listener, callback);
        });
      }
    }
  }

  getUrl(): string {
    return shouldInsertAccessToken(this.notificationsWs)
      ? concatAccessToken(this.notificationsWs, this.authorization.getAuthorization().accessToken)
      : this.notificationsWs;

    function shouldInsertAccessToken(url: string) {
      return url.indexOf('access_token=') < 0;
    }

    function concatAccessToken(url: string, authorization: string) {
      return (/[?&].*=/.test(url) ? url + '&' : url + '?') + 'access_token=' + authorization;
    }
  }

  close(): void {
    this.listeners = {};
    this.closed = true;
    this.webSocket.close();
    this.webSocket = null;
  }
}
