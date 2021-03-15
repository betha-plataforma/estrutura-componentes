import { setupWebSocket } from '../../../../test/utils/spec.helper';
import { getMockAuthorization } from '../../../global/test/helper/api.helper';
import { MessageType } from '../notificacoes.constants';
import { NotificationWebSocket } from '../notificacoes.websocket';

const WEBSOCKET_HOST = 'https://channel.plataforma.betha.cloud/v1';

jest.useFakeTimers();

describe('notificacoes-websocket', () => {
  let onMessageCallback: Function, onCloseCallback: Function, onOpenCallback: Function;
  let sendMock, closeMock, addEventListenerMock;

  beforeEach(async () => {
    // Esta foi a maneira de "mocar" o comportamento do websocket
    sendMock = jest.fn();
    closeMock = jest.fn();
    addEventListenerMock = jest.fn((listener, callback) => {
      if (listener === 'message') {
        onMessageCallback = callback;
      } else if (listener === 'open') {
        onOpenCallback = callback;
      } else if (listener === 'close') {
        onCloseCallback = callback;
      }
    });

    setupWebSocket(sendMock, addEventListenerMock, closeMock);
  });

  it('deve instanciar', () => {
    const websocket = new NotificationWebSocket(getMockAuthorization(), WEBSOCKET_HOST);
    expect(websocket).not.toBeNull();
  });

  it('deve interceptar eventos de "open" do websocket', () => {
    // Arrange
    const websocket = new NotificationWebSocket(getMockAuthorization(), WEBSOCKET_HOST);

    const onOpen = jest.fn();
    websocket.addEventListener('open', onOpen);

    // Act
    onOpenCallback();

    // Assert
    expect(onOpen).toBeCalled();
  });

  it('deve interceptar eventos de "message" do websocket', () => {
    // Arrange
    const websocket = new NotificationWebSocket(getMockAuthorization(), WEBSOCKET_HOST);

    const onMessage = jest.fn();
    websocket.addEventListener('message', onMessage);

    // Act
    onMessageCallback();

    // Assert
    expect(onMessage).toBeCalled();
  });

  it('deve interceptar eventos de "close" do websocket', () => {
    // Arrange
    const websocket = new NotificationWebSocket(getMockAuthorization(), WEBSOCKET_HOST);

    const onClose = jest.fn();
    websocket.addEventListener('close', onClose);

    // Act
    onCloseCallback();

    // Assert
    expect(onClose).toBeCalled();
  });

  it('fecha conexao websocket e desregistra listeners ao chamar o método "close"', () => {
    // Arrange
    const websocket = new NotificationWebSocket(getMockAuthorization(), WEBSOCKET_HOST);

    const onClose = jest.spyOn(NotificationWebSocket.prototype, 'close');

    // Act
    websocket.close();

    // Assert
    expect(onClose).toBeCalled();
    expect(closeMock).toBeCalled();
  });

  it('constroi corretamente url com credenciais via query params', () => {
    // Arrange
    const authorization = getMockAuthorization();
    const websocket = new NotificationWebSocket(authorization, WEBSOCKET_HOST);

    // Act
    const url = websocket.getUrl();

    // Assert
    expect(url).toBe(`${WEBSOCKET_HOST}?access_token=${authorization.getAuthorization().accessToken}`);
  });

  it('não adiciona access_token nos query params caso a url já o tenha', () => {
    // Arrange
    const authorization = getMockAuthorization();
    const websocket = new NotificationWebSocket(authorization, `${WEBSOCKET_HOST}?access_token=${authorization.getAuthorization().accessToken}`);

    // Act
    const url = websocket.getUrl();

    // Assert
    expect(url).toBe(`${WEBSOCKET_HOST}?access_token=${authorization.getAuthorization().accessToken}`);
  });

  it('registra novamente os listeners ao instanciar novamente o websocket através do refresh', () => {
    // Arrange
    const websocket = new NotificationWebSocket(getMockAuthorization(), WEBSOCKET_HOST);

    // Act
    websocket.refresh();

    // Assert
    expect(addEventListenerMock).toBeCalled();
  });

  it('registra novamente os listeners ao instanciar novamente o websocket através do refresh', () => {
    // Arrange
    const websocket = new NotificationWebSocket(getMockAuthorization(), WEBSOCKET_HOST);

    // Act
    websocket.send({ type: MessageType.STARTED });

    // Assert
    expect(sendMock).toBeCalled();
  });

  it('emite evento type=started ao abrir conexão websocket pela primeira vez', () => {
    // Arrange
    new NotificationWebSocket(getMockAuthorization(), WEBSOCKET_HOST);

    // Act
    onOpenCallback();

    // Assert
    expect(sendMock).toBeCalled();
    expect(sendMock.mock.calls[0][0]).toStrictEqual(JSON.stringify({ type: MessageType.STARTED }));
  });

  it('emite evento type=restarted ao abrir conexão websocket após primeira vez', () => {
    // Arrange
    new NotificationWebSocket(getMockAuthorization(), WEBSOCKET_HOST);

    // Act
    onOpenCallback();
    onMessageCallback({ data: JSON.stringify({ type: MessageType.STARTED, sequence: 666 }) });
    onOpenCallback();

    // Assert
    expect(sendMock).toBeCalled();
    expect(sendMock.mock.calls[1][0]).toStrictEqual(JSON.stringify({ type: MessageType.RESTARTED, sequence: 666 }));
  });

  it('chama o "handleUnauthorizedAccess" ao reconectar via evento de "close" 1001', () => {
    // Arrange
    const authorization = getMockAuthorization();
    authorization.handleUnauthorizedAccess = jest.fn(() => {
      return Promise.resolve();
    });
    new NotificationWebSocket(authorization, WEBSOCKET_HOST);

    // Act
    onCloseCallback({ code: 1001 });
    jest.runOnlyPendingTimers();

    // Assert
    expect(authorization.handleUnauthorizedAccess).toBeCalled();
  });

  it('chama o "handleUnauthorizedAccess" ao reconectar via evento de "close" 1006', () => {
    // Arrange
    const authorization = getMockAuthorization();
    authorization.handleUnauthorizedAccess = jest.fn(() => {
      return Promise.resolve();
    });
    new NotificationWebSocket(authorization, WEBSOCKET_HOST);

    // Act
    onCloseCallback({ code: 1006 });
    jest.runOnlyPendingTimers();

    // Assert
    expect(authorization.handleUnauthorizedAccess).toBeCalled();
  });

});
