import { SpecPage, newSpecPage } from '@stencil/core/testing';

import { setupBethaEnvs } from '../../../../test/utils/e2e.helper';
import { setBethaEnvs, setFetchMockData, setupFetchMock, setupTestingEnvs, setFetchMockStatus, setupWebSocket, getFetchMockData } from '../../../../test/utils/spec.helper';
import { getMockAuthorization } from '../../../global/test/helper/api.helper';
import { Notificacoes } from '../notificacoes';
import { ReadAction, MessageType } from '../notificacoes.constants';
import { TipoNotificacao, NotificacaoLink, NotificacaoLeituraEvent, NotificacaoWebsocketMessage } from '../notificacoes.interfaces';
import { NotificacoesService } from '../notificacoes.service';
import { NotificationWebSocket } from '../notificacoes.websocket';
import { PAYLOAD } from './notificacoes.helper';

/**
 * Este método facilita seleção de um determinado filtro de notificações através abstração da emissão de eventos da navbar de filtros
 *
 * @param notificacoes Elemento de notificações <bth-notificacoes>
 * @param filtro Filtro conforme tipo de notificação
 */
function setFiltroAtivo(notificacoes: HTMLBthNotificacoesElement, filtro: TipoNotificacao) {
  notificacoes.dispatchEvent(new CustomEvent('navbarPillItemClicked', { detail: { identificador: filtro.toString() } }));
}

describe('notificacoes', () => {
  let page: SpecPage;
  let sendNotificationWebsocketMessage: Function;

  const REGEX_INDISPONIBILIDADE = /As notificações estão temporariamente indisponíveis/;
  const ENVJS = {
    suite: {
      'notifications': { v1: { host: 'https://api.notifications.betha.cloud/v1' } },
      'notifications-ws': { v1: { host: 'https://channel.notifications.betha.cloud/v1' } }
    }
  };

  beforeAll(() => {

    // Esta foi a maneira de "mocar" o comportamento do websocket
    NotificationWebSocket.prototype.addEventListener = (eventName, callback) => {
      if (eventName === 'message') {
        sendNotificationWebsocketMessage = callback;
      }
    };

  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  beforeEach(async () => {
    setupBethaEnvs();
    setBethaEnvs(ENVJS);

    setupTestingEnvs();

    setupFetchMock();
    setFetchMockData({ content: [] });
    setFetchMockStatus(200);

    setupWebSocket(null, null, null);

    page = await newSpecPage({ components: [Notificacoes] });
  });

  afterEach(async () => {
    // É removido o elemento do conteúdo para possibilitar execução do "disconnectedCallback" de cada componente
    await page.setContent('');
  });

  it('renderiza lightdom', async () => {
    // Arrange
    await page.setContent('<bth-notificacoes></bth-notificacoes>');

    // Act
    await page.waitForChanges();

    // Assert
    expect(page.root).not.toBeNull();
  });

  it('renderiza somente conteúdo', async () => {
    // Arrange
    await page.setContent('<bth-notificacoes only-content></bth-notificacoes>');

    // Act
    await page.waitForChanges();

    // Assert
    expect(page.root).not.toBeNull();
  });

  it('renderiza somente conteúdo com height do painel de notificações customizado', async () => {
    // Arrange
    await page.setContent('<bth-notificacoes only-content height-painel-notificacoes="500px"></bth-notificacoes>');

    // Act
    await page.waitForChanges();

    // Assert
    expect(page.root).not.toBeNull();
  });


  it('exibe indisponibilidade se o authorization não for informado', async () => {
    // Arrange
    setFetchMockData({ content: [] });
    await page.setContent('<bth-notificacoes></bth-notificacoes>');

    // Act
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = undefined;
    await page.waitForChanges();

    // Assert
    expect(notificacoes.shadowRoot.textContent).toMatch(REGEX_INDISPONIBILIDADE);
  });

  it('exibe indisponibilidade ao falhar requisição para a api', async () => {
    // Arrange
    setFetchMockStatus(500);
    setFetchMockData({ detail: { message: 'Erro interno no servidor' } });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    // Act (Ao abrir o painel, a busca por notificações é disparada)
    notificacoes.dispatchEvent(new CustomEvent('painelLateralShow', { detail: { show: true } }));
    await page.waitForChanges();

    // Assert
    expect(notificacoes.shadowRoot.textContent).toMatch(REGEX_INDISPONIBILIDADE);
  });

  it('exibe indisponibilidade se o endereço da api não for informado', async () => {
    // Arrange
    setBethaEnvs({});

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    // Act (Ao abrir o painel, a busca por notificações é disparada)
    notificacoes.dispatchEvent(new CustomEvent('painelLateralShow', { detail: { show: true } }));
    await page.waitForChanges();

    // Assert
    expect(notificacoes.shadowRoot.textContent).toMatch(REGEX_INDISPONIBILIDADE);
  });

  it('exibe indisponibilidade ao tentar carregar notificações lidas sem authorization', async () => {
    // Arrange
    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = undefined;

    // Act
    setFiltroAtivo(notificacoes, TipoNotificacao.Lida);
    await page.waitForChanges();

    // Assert
    expect(notificacoes.shadowRoot.textContent).toMatch(REGEX_INDISPONIBILIDADE);
  });

  it('exibe indisponibilidade ao tentar carregar notificações não lidas sem authorization', async () => {
    // Arrange
    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = undefined;

    // Act
    setFiltroAtivo(notificacoes, TipoNotificacao.NaoLida);
    await page.waitForChanges();

    // Assert
    expect(notificacoes.shadowRoot.textContent).toMatch(REGEX_INDISPONIBILIDADE);
  });

  it('exibe indisponibilidade ao tentar carregar notificações em progresso sem authorization', async () => {
    // Arrange
    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = undefined;

    // Act
    setFiltroAtivo(notificacoes, TipoNotificacao.Progresso);
    await page.waitForChanges();

    // Assert
    expect(notificacoes.shadowRoot.textContent).toMatch(REGEX_INDISPONIBILIDADE);
  });

  it('exibe indisponibilidade ao falhar requisição p/ obter notificações lidas sem', async () => {
    // Arrange
    setFetchMockStatus(500);
    setFetchMockData({ detail: { message: 'Erro interno no servidor' } });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    // Act
    setFiltroAtivo(notificacoes, TipoNotificacao.Lida);
    await page.waitForChanges();

    // Assert
    expect(notificacoes.shadowRoot.textContent).toMatch(REGEX_INDISPONIBILIDADE);
  });

  it('exibe indisponibilidade ao falhar requisição p/ obter notificações não lidas', async () => {
    // Arrange
    setFetchMockStatus(500);
    setFetchMockData({ detail: { message: 'Erro interno no servidor' } });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    // Act
    setFiltroAtivo(notificacoes, TipoNotificacao.NaoLida);
    await page.waitForChanges();

    // Assert
    expect(notificacoes.shadowRoot.textContent).toMatch(REGEX_INDISPONIBILIDADE);
  });

  it('exibe indisponibilidade ao falhar requisição p/ obter notificações em progresso', async () => {
    // Arrange
    setFetchMockStatus(500);
    setFetchMockData({ detail: { message: 'Erro interno no servidor' } });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    // Act
    setFiltroAtivo(notificacoes, TipoNotificacao.Progresso);
    await page.waitForChanges();

    // Assert
    expect(notificacoes.shadowRoot.textContent).toMatch(REGEX_INDISPONIBILIDADE);
  });

  it('não exibe indisponibilidade se "authorization" e "endereco da api" (propriedade) forem informados', async () => {
    // Arrange
    setBethaEnvs({}); // limpa o envjs
    setFetchMockData({ content: [] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.notificacoesApi = ENVJS.suite.notifications.v1.host;
    notificacoes.notificacoesWs = ENVJS.suite['notifications-ws'].v1.host;
    notificacoes.authorization = getMockAuthorization();

    // Act (Ao abrir o painel, a busca por notificações é disparada)
    notificacoes.dispatchEvent(new CustomEvent('painelLateralShow', { detail: { show: true } }));
    await page.waitForChanges();

    // Assert
    expect(notificacoes.shadowRoot.textContent).not.toMatch(REGEX_INDISPONIBILIDADE);
  });

  it('não exibe indisponibilidade se "authorization" e "endereco da api" (envjs) forem informados', async () => {
    // Arrange
    setFetchMockData({ content: [] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    // Act (Ao abrir o painel, a busca por notificações é disparada)
    notificacoes.dispatchEvent(new CustomEvent('painelLateralShow', { detail: { show: true } }));
    await page.waitForChanges();

    // Assert
    expect(notificacoes.shadowRoot.textContent).not.toMatch(REGEX_INDISPONIBILIDADE);
  });

  it('permite na aba de não lidas, marcar todas como lidas através de link', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    const onClearUnreads = jest.spyOn(NotificacoesService.prototype, 'clearUnreads');

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    setFiltroAtivo(notificacoes, TipoNotificacao.NaoLida);
    await page.waitForChanges();

    // Act
    const marcarTodasLida: HTMLAnchorElement = notificacoes.shadowRoot.querySelector('a.link');
    marcarTodasLida.click();
    await page.waitForChanges();

    // Assert
    expect(onClearUnreads).toBeCalled();
  });

  it('exibe lista de notificacoes lidas', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    // Act
    setFiltroAtivo(notificacoes, TipoNotificacao.Lida);
    await page.waitForChanges();

    // Assert
    const notificacaoItem: HTMLBthNotificacaoItemElement = notificacoes.shadowRoot.querySelector('bth-notificacao-item');
    expect(notificacaoItem).not.toBeNull();
    expect(notificacaoItem.getAttribute('identificador')).toBe(PAYLOAD.id);
  });

  it('exibe lista de notificacoes não lidas', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    // Act
    setFiltroAtivo(notificacoes, TipoNotificacao.NaoLida);
    await page.waitForChanges();

    // Assert
    const notificacaoItem: HTMLBthNotificacaoItemElement = notificacoes.shadowRoot.querySelector('bth-notificacao-item');
    expect(notificacaoItem).not.toBeNull();
    expect(notificacaoItem.getAttribute('identificador')).toBe(PAYLOAD.id);
  });

  it('exibe lista de notificacoes em progresso', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    // Act
    setFiltroAtivo(notificacoes, TipoNotificacao.Progresso);
    await page.waitForChanges();

    // Assert
    const notificacaoItem: HTMLBthNotificacaoItemElement = notificacoes.shadowRoot.querySelector('bth-notificacao-item');
    expect(notificacaoItem).not.toBeNull();
    expect(notificacaoItem.getAttribute('identificador')).toBe(PAYLOAD.id);
  });

  it('exibe lista vazia quando não houver notificacoes lidas', async () => {
    // Arrange
    setFetchMockData({ content: [] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    // Act
    setFiltroAtivo(notificacoes, TipoNotificacao.Lida);
    await page.waitForChanges();

    // Assert
    const notificacaoItem: HTMLBthNotificacaoItemElement = notificacoes.shadowRoot.querySelector('bth-notificacao-item');
    expect(notificacaoItem).toBeNull();

    const emptyState: HTMLDivElement = notificacoes.shadowRoot.querySelector('.empty-notificacoes');
    expect(emptyState).not.toBeNull();
    expect(emptyState.textContent).toBe('Não há notificações por aqui');
  });

  it('exibe lista vazia quando não houver notificacoes não lidas', async () => {
    // Arrange
    setFetchMockData({ content: [] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    // Act
    setFiltroAtivo(notificacoes, TipoNotificacao.NaoLida);
    await page.waitForChanges();

    // Assert
    const notificacaoItem: HTMLBthNotificacaoItemElement = notificacoes.shadowRoot.querySelector('bth-notificacao-item');
    expect(notificacaoItem).toBeNull();

    const emptyState: HTMLDivElement = notificacoes.shadowRoot.querySelector('.empty-notificacoes');
    expect(emptyState).not.toBeNull();
    expect(emptyState.textContent).toBe('Não há notificações por aqui');
  });

  it('exibe lista vazia quando não houver notificacoes em progresso', async () => {
    // Arrange
    setFetchMockData({ content: [] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    // Act
    setFiltroAtivo(notificacoes, TipoNotificacao.Progresso);
    await page.waitForChanges();

    // Assert
    const notificacaoItem: HTMLBthNotificacaoItemElement = notificacoes.shadowRoot.querySelector('bth-notificacao-item');
    expect(notificacaoItem).toBeNull();

    const emptyState: HTMLDivElement = notificacoes.shadowRoot.querySelector('.empty-notificacoes');
    expect(emptyState).not.toBeNull();
    expect(emptyState.textContent).toBe('Não há notificações por aqui');
  });

  it('atribui ao contador do icone do menu o número correspondente a notificacoes não lidas', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    // Act
    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    setFiltroAtivo(notificacoes, TipoNotificacao.NaoLida);
    await page.waitForChanges();

    // Assert (verifica tanto na versão desktop quanto mobile)
    const menuFerramentaIcones: NodeListOf<HTMLBthMenuFerramentaIconeElement> = notificacoes.shadowRoot.querySelectorAll('bth-menu-ferramenta-icone');
    menuFerramentaIcones.forEach((menuFerramentaIcone) => {
      expect(menuFerramentaIcone).not.toBeNull();
      expect(menuFerramentaIcone.getAttribute('contador')).toEqual(getFetchMockData().content.length.toString());
    });
  });

  it('abre url em nova janela ao receber evento de notificação lida', async () => {
    // Arrange
    setBethaEnvs({});
    const spy = jest.spyOn(window, 'open').mockImplementation();

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    let notificacoes: HTMLBthNovidadesElement = page.body.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    const resultadoLink: NotificacaoLink = { href: 'https://www.google.com/', title: 'Visualizar resultado', label: 'Resultado', target: 'BLANK' };

    // Act
    notificacoes.dispatchEvent(new CustomEvent<NotificacaoLeituraEvent>('notificacaoLida', {
      detail: { id: PAYLOAD.id, url: resultadoLink.href, target: '_blank' }
    }));

    await page.waitForChanges();

    // Assert
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(resultadoLink.href, '_blank');

    spy.mockRestore();
  });

  it('marca notificação como lida ao receber evento', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });
    const onSetRead = jest.spyOn(NotificacoesService.prototype, 'setRead');

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    setFiltroAtivo(notificacoes, TipoNotificacao.NaoLida);
    await page.waitForChanges();

    // Act
    notificacoes.dispatchEvent(new CustomEvent<NotificacaoLeituraEvent>('notificacaoLida', {
      detail: { id: PAYLOAD.id, url: 'https://www.google.com/', target: '_blank' }
    }));

    await page.waitForChanges();

    // Assert
    expect(onSetRead).toBeCalled();
    expect(onSetRead.mock.calls[0][0]).toStrictEqual(PAYLOAD.id);
  });

  it('marca notificação como não lida ao receber evento', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });
    const onSetUnread = jest.spyOn(NotificacoesService.prototype, 'setUnread');

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    setFiltroAtivo(notificacoes, TipoNotificacao.Lida);
    await page.waitForChanges();

    // Act
    notificacoes.dispatchEvent(new CustomEvent<NotificacaoLeituraEvent>('notificacaoNaoLida', {
      detail: { id: PAYLOAD.id, url: 'https://www.google.com/', target: '_blank' }
    }));

    await page.waitForChanges();

    // Assert
    expect(onSetUnread).toBeCalled();
    expect(onSetUnread.mock.calls[0][0]).toStrictEqual(PAYLOAD.id);
  });

  it('emite evento que não possui conteudo sinalizado ao ler a ultima notificacao pendente', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    let onNaoPossuiConteudoSinalizado = jest.fn();
    notificacoes.addEventListener('conteudoSinalizado', onNaoPossuiConteudoSinalizado);

    setFiltroAtivo(notificacoes, TipoNotificacao.NaoLida);
    await page.waitForChanges();

    // Act
    notificacoes.dispatchEvent(new CustomEvent<NotificacaoLeituraEvent>('notificacaoLida', {
      detail: { id: PAYLOAD.id, url: 'https://www.google.com/', target: '_blank' }
    }));

    await page.waitForChanges();

    // Assert
    expect(onNaoPossuiConteudoSinalizado).toHaveBeenCalled();
    expect(onNaoPossuiConteudoSinalizado.mock.calls[1][0].detail).toStrictEqual({ possui: false, origem: 'notificacoes', quantidadeTotalNaoLidas: 0 });

    notificacoes.removeEventListener('conteudoSinalizado', onNaoPossuiConteudoSinalizado);
  });

  it('emite evento que possui conteudo sinalizado ao marcar como não lida uma notificacao', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    let onPossuiConteudoSinalizado = jest.fn();
    notificacoes.addEventListener('conteudoSinalizado', onPossuiConteudoSinalizado);

    setFiltroAtivo(notificacoes, TipoNotificacao.Lida);
    await page.waitForChanges();

    // Act
    notificacoes.dispatchEvent(new CustomEvent<NotificacaoLeituraEvent>('notificacaoNaoLida', {
      detail: { id: PAYLOAD.id, url: 'https://www.google.com/', target: '_blank' }
    }));

    await page.waitForChanges();

    // Assert
    expect(onPossuiConteudoSinalizado).toHaveBeenCalled();
    expect(onPossuiConteudoSinalizado.mock.calls[0][0].detail).toStrictEqual({ possui: true, origem: 'notificacoes', quantidadeTotalNaoLidas: 1 });

    notificacoes.removeEventListener('conteudoSinalizado', onPossuiConteudoSinalizado);
  });

  it('ao abrir seleciona painel de não lidas caso haja pendentes', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    await page.waitForChanges();

    // Act
    const message: NotificacaoWebsocketMessage = {
      type: MessageType.STARTED,
      unread: 1,
      unreadInProgress: 0
    };

    sendNotificationWebsocketMessage({ data: JSON.stringify(message) });
    await page.waitForChanges();

    // Assert
    const navbarPillItemAtivo: HTMLBthNavbarPillItemElement = notificacoes.shadowRoot.querySelector('bth-navbar-pill-item[ativo]');
    expect(navbarPillItemAtivo).not.toBeNull();
    expect(navbarPillItemAtivo.getAttribute('ativo')).toBeDefined();
    expect(navbarPillItemAtivo.getAttribute('identificador')).toBe(TipoNotificacao.NaoLida.toString());
  });

  it('ao abrir seleciona painel em progresso não lidas caso haja pendentes', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    await page.waitForChanges();

    // Act
    const message: NotificacaoWebsocketMessage = {
      type: MessageType.STARTED,
      unread: 0,
      unreadInProgress: 1
    };

    sendNotificationWebsocketMessage({ data: JSON.stringify(message) });
    await page.waitForChanges();

    // Assert
    const navbarPillItemAtivo: HTMLBthNavbarPillItemElement = notificacoes.shadowRoot.querySelector('bth-navbar-pill-item[ativo]');
    expect(navbarPillItemAtivo).not.toBeNull();
    expect(navbarPillItemAtivo.getAttribute('ativo')).toBeDefined();
    expect(navbarPillItemAtivo.getAttribute('identificador')).toBe(TipoNotificacao.Progresso.toString());
  });

  it('ao abrir seleciona painel de lidas por se não houver nenhuma pendente', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    await page.waitForChanges();

    // Act
    const message: NotificacaoWebsocketMessage = {
      type: MessageType.STARTED,
      unread: 0,
      unreadInProgress: 0
    };

    sendNotificationWebsocketMessage({ data: JSON.stringify(message) });
    await page.waitForChanges();

    // Assert
    const navbarPillItemAtivo: HTMLBthNavbarPillItemElement = notificacoes.shadowRoot.querySelector('bth-navbar-pill-item[ativo]');
    expect(navbarPillItemAtivo).not.toBeNull();
    expect(navbarPillItemAtivo.getAttribute('ativo')).toBeDefined();
    expect(navbarPillItemAtivo.getAttribute('identificador')).toBe(TipoNotificacao.Lida.toString());
  });

  it('adiciona notificação não lida ao receber via websocket', async () => {
    // Arrange
    setFetchMockData({ content: [] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();
    setFiltroAtivo(notificacoes, TipoNotificacao.NaoLida);
    await page.waitForChanges();

    // Act
    const message: NotificacaoWebsocketMessage = {
      type: MessageType.NEW_NOTIFICATIONS,
      notifications: [PAYLOAD]
    };
    sendNotificationWebsocketMessage({ data: JSON.stringify(message) });

    await page.waitForChanges();

    // Assert
    const notificacaoItem: HTMLBthNotificacaoItemElement = notificacoes.shadowRoot.querySelector('bth-notificacao-item');
    expect(notificacaoItem).not.toBeNull();
    expect(notificacaoItem.getAttribute('identificador')).toBe(PAYLOAD.id);
  });

  it('adiciona notificação em progresso ao receber via websocket', async () => {
    // Arrange
    setFetchMockData({ content: [] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();
    setFiltroAtivo(notificacoes, TipoNotificacao.Progresso);
    await page.waitForChanges();

    // Act
    const payloadEmProgresso = { ...PAYLOAD, priority: 1, status: 'OPEN' };
    const message: NotificacaoWebsocketMessage = {
      type: MessageType.NEW_NOTIFICATIONS,
      notifications: [payloadEmProgresso]
    };
    sendNotificationWebsocketMessage({ data: JSON.stringify(message) });

    await page.waitForChanges();

    // Assert
    const notificacaoItem: HTMLBthNotificacaoItemElement = notificacoes.shadowRoot.querySelector('bth-notificacao-item');
    expect(notificacaoItem).not.toBeNull();
    expect(notificacaoItem.getAttribute('identificador')).toBe(PAYLOAD.id);
  });

  it('move notificação em progresso que foi concluída para as lidas ao receber via websocket', async () => {
    // Arrange
    setFetchMockData({ content: [] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();
    setFiltroAtivo(notificacoes, TipoNotificacao.Lida);
    await page.waitForChanges();

    // Act
    const payloadEmProgresso = { ...PAYLOAD, priority: 1, status: 'DONE', read: true };
    const message: NotificacaoWebsocketMessage = {
      type: MessageType.NEW_NOTIFICATIONS,
      notifications: [payloadEmProgresso]
    };
    sendNotificationWebsocketMessage({ data: JSON.stringify(message) });

    await page.waitForChanges();

    // Assert
    const notificacaoItem: HTMLBthNotificacaoItemElement = notificacoes.shadowRoot.querySelector('bth-notificacao-item');
    expect(notificacaoItem).not.toBeNull();
    expect(notificacaoItem.getAttribute('identificador')).toBe(PAYLOAD.id);
  });

  it('marca notificação como lida ao receber via websocket', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    setFiltroAtivo(notificacoes, TipoNotificacao.NaoLida);
    await page.waitForChanges();

    // Act
    const message: NotificacaoWebsocketMessage = {
      type: MessageType.READ_ACTION,
      readAction: {
        action: ReadAction.READ_MESSAGE,
        message: PAYLOAD
      }
    };
    sendNotificationWebsocketMessage({ data: JSON.stringify(message) });

    await page.waitForChanges();

    setFiltroAtivo(notificacoes, TipoNotificacao.Lida);
    await page.waitForChanges();

    // Assert
    const notificacaoItem: HTMLBthNotificacaoItemElement = notificacoes.shadowRoot.querySelector('bth-notificacao-item');
    expect(notificacaoItem).not.toBeNull();
    expect(notificacaoItem.getAttribute('identificador')).toBe(PAYLOAD.id);
  });

  it('marca notificação como não lida ao receber via websocket', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    setFiltroAtivo(notificacoes, TipoNotificacao.Lida);
    await page.waitForChanges();

    // Act
    const message: NotificacaoWebsocketMessage = {
      type: MessageType.READ_ACTION,
      readAction: {
        action: ReadAction.UNREAD_MESSAGE,
        message: PAYLOAD
      }
    };
    sendNotificationWebsocketMessage({ data: JSON.stringify(message) });

    await page.waitForChanges();

    setFiltroAtivo(notificacoes, TipoNotificacao.NaoLida);
    await page.waitForChanges();

    // Assert
    const notificacaoItem: HTMLBthNotificacaoItemElement = notificacoes.shadowRoot.querySelector('bth-notificacao-item');
    expect(notificacaoItem).not.toBeNull();
    expect(notificacaoItem.getAttribute('identificador')).toBe(PAYLOAD.id);
  });

  it('marca todas as notificações como lida ao receber via websocket', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    setFiltroAtivo(notificacoes, TipoNotificacao.Lida);
    await page.waitForChanges();

    // Act
    const message: NotificacaoWebsocketMessage = {
      type: MessageType.READ_ACTION,
      readAction: {
        action: ReadAction.READ_ALL_CLOSED,
        message: PAYLOAD
      }
    };
    sendNotificationWebsocketMessage({ data: JSON.stringify(message) });

    await page.waitForChanges();

    setFiltroAtivo(notificacoes, TipoNotificacao.NaoLida);
    await page.waitForChanges();

    // Assert
    const notificacaoItem: HTMLBthNotificacaoItemElement = notificacoes.shadowRoot.querySelector('bth-notificacao-item');
    expect(notificacaoItem).not.toBeNull();
    expect(notificacaoItem.getAttribute('identificador')).toBe(PAYLOAD.id);
  });

  it('marca todas as notificações como lida ao receber "READ_ALL_CLOSED" via websocket', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    setFiltroAtivo(notificacoes, TipoNotificacao.Lida);
    await page.waitForChanges();

    // Act
    const message: NotificacaoWebsocketMessage = {
      type: MessageType.READ_ACTION,
      readAction: {
        action: ReadAction.READ_ALL,
        message: PAYLOAD
      }
    };
    sendNotificationWebsocketMessage({ data: JSON.stringify(message) });

    await page.waitForChanges();

    setFiltroAtivo(notificacoes, TipoNotificacao.NaoLida);
    await page.waitForChanges();

    // Assert
    const notificacaoItem: HTMLBthNotificacaoItemElement = notificacoes.shadowRoot.querySelector('bth-notificacao-item');
    expect(notificacaoItem).not.toBeNull();
    expect(notificacaoItem.getAttribute('identificador')).toBe(PAYLOAD.id);
  });

  it('marca todas as notificações como lida ao receber "READ_ALL" via websocket', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    setFiltroAtivo(notificacoes, TipoNotificacao.Lida);
    await page.waitForChanges();

    // Act
    const message: NotificacaoWebsocketMessage = {
      type: MessageType.READ_ACTION,
      readAction: {
        action: ReadAction.READ_ALL,
        message: PAYLOAD
      }
    };
    sendNotificationWebsocketMessage({ data: JSON.stringify(message) });

    await page.waitForChanges();

    setFiltroAtivo(notificacoes, TipoNotificacao.NaoLida);
    await page.waitForChanges();

    // Assert
    const notificacaoItem: HTMLBthNotificacaoItemElement = notificacoes.shadowRoot.querySelector('bth-notificacao-item');
    expect(notificacaoItem).not.toBeNull();
    expect(notificacaoItem.getAttribute('identificador')).toBe(PAYLOAD.id);
  });

  it('marca todas as notificações como lida ao receber "READ_ALL" via websocket', async () => {
    // Arrange
    setFetchMockData({ content: [PAYLOAD] });

    await page.setContent('<bth-notificacoes></bth-notificacoes>');
    const notificacoes: HTMLBthNotificacoesElement = page.doc.querySelector('bth-notificacoes');
    notificacoes.authorization = getMockAuthorization();

    setFiltroAtivo(notificacoes, TipoNotificacao.Progresso);
    await page.waitForChanges();

    // Act
    const message: NotificacaoWebsocketMessage = {
      type: MessageType.READ_ACTION,
      readAction: {
        action: ReadAction.READ_ALL_IN_PROGRESS,
        message: PAYLOAD
      }
    };
    sendNotificationWebsocketMessage({ data: JSON.stringify(message) });

    await page.waitForChanges();

    // Assert
    const notificacaoItem: HTMLBthNotificacaoItemElement = notificacoes.shadowRoot.querySelector('bth-notificacao-item');
    expect(notificacaoItem).not.toBeNull();
    expect(notificacaoItem.getAttribute('identificador')).toBe(PAYLOAD.id);
  });

});
