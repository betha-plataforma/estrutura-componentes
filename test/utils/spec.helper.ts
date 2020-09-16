/**
 * Configura uma variável global a ser utilizada para armazenar variáveis mockadas entre cenários de testes
 */
export function setupTestingEnvs() {
  setGlobalOrWindowProperty(global, '___testing', {});
}

/**
 * Configura um mock para possibilitar interceptar a Web API do "fetch", definindo conteúdo e status de requests.
 *
 * Para obter/definir valores de status e dados da resposta @see setFetchMockStatus e @see setFetchMockData
 */
export function setupFetchMock() {

  // @ts-ignore
  global.___testing.fetch = {};

  const mock = jest.fn().mockImplementation(() => {
    return Promise.resolve({
      status: getFetchMockStatus(),
      json: () => Promise.resolve(getFetchMockData())
    });
  });

  setGlobalOrWindowProperty(global, 'fetch', mock);

  return mock;
}

/**
 * Configura um mock para possibilitar interceptar a Web API do "localStorage"
 */
export function setupLocalStorage() {
  let store = {};

  const mock = (() => {
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => store[key] = value.toString(),
      removeItem: (key) => delete store[key],
      clear: () => store = {}
    };
  })();

  setGlobalOrWindowProperty(global, 'localStorage', mock);

  return mock;
}

/**
 * Configura um mock para possibilitar lidar com a interface de WebSocket que por padrão não está disponível no Node environment.
 */
export function setupWebSocket(send, addEventListener, close) {
  const any = () => { };

  function WebSocket() {
    return {
      send: send || any,
      addEventListener: addEventListener || any,
      close: close || any
    };
  }

  setGlobalOrWindowProperty(global, 'WebSocket', WebSocket);

  return WebSocket;
}

/**
 * Mocka o "window.matchMedia", onde é utilizado para determinar se é dispositivo móvel.
 *
 * Use matches = "false" para mobile
 * Use matches = "true" para desktop
 */
export function setupMatchingMediaQuery(matches: boolean = false) {
  setGlobalOrWindowProperty(window, 'matchMedia', () => ({ matches }));
}

/**
 * Define valor para atributo global/window
 *
 * @param source Fonte global (node.js) ou window (browser)
 * @param propertyName Nome da propriedade
 * @param value Valor
 */
export function setGlobalOrWindowProperty(source: NodeJS.Global | Window, propertyName: any, value: any) {
  Object.defineProperty(source, propertyName, {
    writable: true,
    configurable: true,
    value
  });
}

/**
 * Define o env.js no "window" do contexto atual através da propriedade "___bth"
 * @param envs Objeto do Env.js
 */
export function setBethaEnvs(envs: Object) {
  setGlobalOrWindowProperty(window, '___bth', { envs });
}

/**
 * Define um código de status para o mock do fetch
 * @param status Código do status
 */
export function setFetchMockStatus(status: number) {
  // @ts-ignore
  global.___testing.fetch.status = status;
}

/**
 * Define os dados a serem retornado pelo método "json()" do mock do fetch
 * @param data Dados
 */
export function setFetchMockData(data: any) {
  // @ts-ignore
  global.___testing.fetch.data = data;
}

/**
 * Obtém os dados do mock do fetch
 */
export function getFetchMockData() {
  // @ts-ignore
  return global.___testing?.fetch?.data || { success: true };
}

/**
 * Obtém o status do mock do fetch
 */
export function getFetchMockStatus() {
  // @ts-ignore
  return global.___testing?.fetch?.status || 200;
}
