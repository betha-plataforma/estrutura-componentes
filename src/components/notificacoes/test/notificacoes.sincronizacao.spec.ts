import { SpecPage, newSpecPage } from '@stencil/core/testing';

import { setupBethaEnvs } from '../../../../test/utils/e2e.helper';
import { setBethaEnvs, setupTestingEnvs, setupWebSocket } from '../../../../test/utils/spec.helper';
import { getMockAuthorization } from '../../../global/test/helper/api.helper';
import { NotificacaoItem } from '../notificacao-item/notificacao-item';
import { Notificacoes } from '../notificacoes';
import { MessageType } from '../notificacoes.constants';
import { NotificationWebSocket } from '../notificacoes.websocket';

interface NotificacaoServidor {
  id: string;
  text: string;
  epoch: number;
}

const paraApi = (notificacao: NotificacaoServidor) => ({
  id: notificacao.id,
  text: notificacao.text,
  dateTime: notificacao.epoch,
  priority: 2,
  status: 'CLOSED',
  read: false,
  sequence: 1,
});

const paraWebsocketIso = (notificacao: NotificacaoServidor) => ({
  ...paraApi(notificacao),
  dateTime: new Date(notificacao.epoch).toISOString().replace('Z', '+00:00'),
});

describe('notificacoes - sincronizacao entre websocket e api', () => {
  let page: SpecPage;
  let enviarMensagemWebsocket: Function;
  let notificacoesServidor: NotificacaoServidor[];

  const agora = Date.now();
  const ANTIGA: NotificacaoServidor = { id: 'antiga', text: 'Antiga', epoch: agora - 3 * 60 * 60 * 1000 };
  const NOVA: NotificacaoServidor = { id: 'nova', text: 'Nova', epoch: agora - 5 * 60 * 1000 };
  const NAO_ENTREGUE: NotificacaoServidor = { id: 'nao-entregue', text: 'Não entregue pelo websocket', epoch: agora - 4 * 60 * 1000 };

  beforeAll(() => {
    NotificationWebSocket.prototype.addEventListener = (eventName, callback) => {
      if (eventName === 'message') {
        enviarMensagemWebsocket = callback;
      }
    };
  });

  beforeEach(async () => {
    page = await newSpecPage({ components: [Notificacoes, NotificacaoItem] });

    setupBethaEnvs();
    setBethaEnvs({
      suite: {
        'notifications': { v1: { host: 'https://api.notifications.betha.cloud/v1' } },
        'notifications-ws': { v1: { host: 'https://channel.notifications.betha.cloud/v1' } }
      }
    });
    setupTestingEnvs();
    setupWebSocket(null, null, null);

    notificacoesServidor = [];
    const fetchServidor = jest.fn().mockImplementation((url: string) => {
      const parametros = new URL(url).searchParams;
      const offset = Number(parametros.get('offset') || 0);
      const limit = Number(parametros.get('limit') || 20);
      const naoLidas = /unreads\/all/.test(url) ? [...notificacoesServidor].sort((a, b) => b.epoch - a.epoch) : [];
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ content: naoLidas.slice(offset, offset + limit).map(paraApi), hasNext: naoLidas.length > offset + limit })
      });
    });
    // @ts-ignore
    global.fetch = fetchServidor;
    // @ts-ignore
    window.fetch = fetchServidor;
  });

  afterEach(async () => {
    await page.setContent('');
  });

  async function iniciar(naoLidas: number): Promise<HTMLBthNotificacoesElement> {
    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();
    await page.waitForChanges();
    enviarMensagemWebsocket({ data: JSON.stringify({ type: MessageType.STARTED, unread: naoLidas, unreadInProgress: 0, sequence: 10 }) });
    await aguardar();
    return notificacoes;
  }

  function receberPeloWebsocket(notificacao: object) {
    enviarMensagemWebsocket({ data: JSON.stringify({ type: MessageType.NEW_NOTIFICATIONS, notifications: [notificacao], sequence: 11 }) });
  }

  async function abrirPainel(notificacoes: HTMLBthNotificacoesElement) {
    notificacoes.dispatchEvent(new CustomEvent('painelLateralShow', { detail: { show: true } }));
    await aguardar();
  }

  async function aguardar() {
    await page.waitForChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    await page.waitForChanges();
  }

  function identificadoresListados(notificacoes: HTMLBthNotificacoesElement): string[] {
    return Array.from(notificacoes.shadowRoot.querySelectorAll('bth-notificacao-item'))
      .map((item: HTMLBthNotificacaoItemElement) => item.identificador);
  }

  function contador(notificacoes: HTMLBthNotificacoesElement): string {
    return notificacoes.shadowRoot.querySelector('bth-menu-ferramenta-icone').getAttribute('contador');
  }

  it('não duplica notificação recebida pelo websocket quando a página da api também a traz', async () => {
    notificacoesServidor = [ANTIGA, NOVA];
    const notificacoes = await iniciar(0);
    receberPeloWebsocket(paraWebsocketIso(NOVA));
    await aguardar();

    notificacoesServidor = [ANTIGA, NOVA, NAO_ENTREGUE];
    await abrirPainel(notificacoes);

    expect(identificadoresListados(notificacoes).filter(id => id === NOVA.id)).toHaveLength(1);
  });

  it('atualiza em vez de duplicar ao receber pelo websocket uma notificação já listada', async () => {
    notificacoesServidor = [ANTIGA, NOVA];
    const notificacoes = await iniciar(2);
    await abrirPainel(notificacoes);
    expect(contador(notificacoes)).toBe('2');

    receberPeloWebsocket({ ...paraApi(NOVA), text: 'Nova (atualizada)' });
    await aguardar();

    const itens = Array.from(notificacoes.shadowRoot.querySelectorAll('bth-notificacao-item')) as HTMLBthNotificacaoItemElement[];
    const copiasDaNova = itens.filter(item => item.identificador === NOVA.id);
    expect(copiasDaNova.length).toBe(1);
    expect(copiasDaNova[0].texto).toBe('Nova (atualizada)');
    expect(contador(notificacoes)).toBe('2');
  });

  it('lista em ordem cronológica notificações da api e do websocket com dateTime em formatos diferentes', async () => {
    notificacoesServidor = [ANTIGA];
    const notificacoes = await iniciar(0);
    receberPeloWebsocket(paraWebsocketIso(NOVA));
    await aguardar();

    notificacoesServidor = [ANTIGA, NOVA];
    await abrirPainel(notificacoes);

    expect(identificadoresListados(notificacoes)).toEqual([NOVA.id, ANTIGA.id]);
  });
});
