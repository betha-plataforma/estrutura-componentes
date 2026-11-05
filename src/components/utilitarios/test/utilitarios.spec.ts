import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { setBethaEnvs, setGlobalOrWindowProperty } from '../../../../test/utils/spec.helper';
import { AuthorizationConfig } from '../../../global/interfaces';
import { Utilitarios } from '../utilitarios';

const flushPromises = () => new Promise<void>(resolve => setTimeout(resolve, 0));

const autorizacaoValida = (): AuthorizationConfig => ({
  getAuthorization: () => ({ accessToken: 'ACCESS_TOKEN' }),
  handleUnauthorizedAccess: () => Promise.resolve()
});

const nomesDoPainel = (utilitarios: HTMLBthUtilitariosElement): Array<string> =>
  Array.from(utilitarios.shadowRoot.querySelectorAll('[slot=conteudo_painel_lateral] .descricao'))
    .map(elemento => elemento.textContent);

describe('utilitarios', () => {
  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({ components: [Utilitarios] });
  });

  afterEach(() => {
    delete (window as any)['___bth'];
  });

  it('renderiza icone desktop', async () => {
    // Act
    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');

    // Assert
    expect(utilitarios).not.toBeNull();

    expect(utilitarios.shadowRoot.querySelector('bth-menu-ferramenta').getAttribute('descricao')).toEqual('Utilitários');
    expect(utilitarios.shadowRoot.querySelector('bth-menu-ferramenta').getAttribute('tituloPainelLateral')).toEqual('Utilitários');

    const menuFerramentaIcone: HTMLBthMenuFerramentaIconeElement = utilitarios.shadowRoot.querySelector('[slot=menu_item_desktop]');
    expect(menuFerramentaIcone).not.toBeNull();
    expect(menuFerramentaIcone.getAttribute('icone')).toBe('view-grid');
  });

  it('renderiza icone mobile', async () => {
    // Act
    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');

    // Assert
    expect(utilitarios).not.toBeNull();

    const menuFerramentaIcone: HTMLBthMenuFerramentaIconeElement = utilitarios.shadowRoot.querySelector('[slot=menu_item_mobile]');
    expect(menuFerramentaIcone).not.toBeNull();
    expect(menuFerramentaIcone.getAttribute('icone')).toBe('view-grid');
  });

  it('renderiza descrição mobile', async () => {
    // Act
    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');

    // Assert
    expect(utilitarios).not.toBeNull();

    const descricaoMobile: HTMLSpanElement = utilitarios.shadowRoot.querySelector('[slot=menu_descricao_mobile]');
    expect(descricaoMobile).not.toBeNull();
    expect(descricaoMobile.textContent).toBe('Utilitários');
  });

  it('renderiza conteúdo painel lateral com um card normal', async () => {
    // Arrange
    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitario = { nome: 'Lorem Ipsum', rota: '/lorem/ipsuim', icone: 'key', possuiPermissao: true, };

    // Act
    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');
    utilitarios.utilitarios = [utilitario];
    await page.waitForChanges();

    // Assert
    const utilitarioButton: HTMLButtonElement = utilitarios.shadowRoot.querySelector('[slot=conteudo_painel_lateral] button.bth__card');
    expect(utilitarioButton.classList.contains('bth__card--clickable')).toBeTruthy();
    expect(utilitarioButton.textContent).toBe(utilitario.nome);
    expect(utilitarioButton.getAttribute('disabled')).toBeNull();
    expect(utilitarioButton.getAttribute('aria-disabled')).toBe('false');
    expect(utilitarioButton.getAttribute('aria-label')).toBe(`Acessar o utilitário ${utilitario.nome}`);

    const iconeUtilitario: HTMLBthIconeElement = utilitarioButton.querySelector('bth-icone');
    expect(iconeUtilitario.getAttribute('icone')).toBe(utilitario.icone);
  });

  it('renderiza conteúdo painel lateral com um card sem permissão', async () => {
    // Arrange
    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitario = { nome: 'Lorem Ipsum', rota: '/lorem/ipsuim', icone: 'key', possuiPermissao: false, };

    // Act
    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');
    utilitarios.utilitarios = [utilitario];
    await page.waitForChanges();

    // Assert
    const utilitarioButton: HTMLButtonElement = utilitarios.shadowRoot.querySelector('[slot=conteudo_painel_lateral] button.bth__card');
    expect(utilitarioButton.classList.contains('bth__card--disabled')).toBeTruthy();
    expect(utilitarioButton.textContent).toBe(utilitario.nome);
    expect(utilitarioButton.getAttribute('disabled')).toBeDefined();
    expect(utilitarioButton.getAttribute('aria-disabled')).toBe('true');
    expect(utilitarioButton.getAttribute('aria-label')).toBe(`Acessar o utilitário ${utilitario.nome}`);

    const iconeUtilitario: HTMLBthIconeElement = utilitarioButton.querySelector('bth-icone');
    expect(iconeUtilitario.getAttribute('icone')).toBe(utilitario.icone);
  });

  it('emite evento de utilitario selecionado ao clicar no utiltário', async () => {
    // Arrange
    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitario = { nome: 'Lorem Ipsum', rota: '/lorem/ipsuim', icone: 'key', possuiPermissao: true, };

    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');
    utilitarios.utilitarios = [utilitario];
    await page.waitForChanges();

    let onOpcaoUtilitarioSelecionada = jest.fn();
    utilitarios.addEventListener('opcaoUtilitarioSelecionada', onOpcaoUtilitarioSelecionada);

    // Act
    const utilitarioButton: HTMLButtonElement = utilitarios.shadowRoot.querySelector('[slot=conteudo_painel_lateral] button.bth__card');
    utilitarioButton.click();
    await page.waitForChanges();

    // Assert
    expect(onOpcaoUtilitarioSelecionada).toHaveBeenCalled();
    expect(onOpcaoUtilitarioSelecionada.mock.calls[0][0].detail).toStrictEqual({
      nome: utilitario.nome,
      icone: utilitario.icone,
      rota: utilitario.rota
    });
  });

  it('não emite evento de utilitario selecionado ao clicar em utiltário que não possui permissão', async () => {
    // Arrange
    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitario = { nome: 'Lorem Ipsum', rota: '/lorem/ipsuim', icone: 'key', possuiPermissao: false, };

    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');
    utilitarios.utilitarios = [utilitario];
    await page.waitForChanges();

    let onOpcaoUtilitarioSelecionada = jest.fn();
    utilitarios.addEventListener('opcaoUtilitarioSelecionada', onOpcaoUtilitarioSelecionada);

    // Act
    const utilitarioButton: HTMLButtonElement = utilitarios.shadowRoot.querySelector('[slot=conteudo_painel_lateral] button.bth__card');
    utilitarioButton.click();
    await page.waitForChanges();

    // Assert
    expect(onOpcaoUtilitarioSelecionada).not.toHaveBeenCalled();
  });

  it('não busca utilitários centrais com a flag desligada (comportamento legado)', async () => {
    // Arrange
    const fetchMock = jest.fn();
    setGlobalOrWindowProperty(global, 'fetch', fetchMock);

    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');

    // Act — mesmo com authorization e host, sem a flag não há chamada
    utilitarios.utilitarios = [{ nome: 'Do Sistema', rota: '/sistema', icone: 'key', possuiPermissao: true }];
    utilitarios.utilitariosHost = 'https://utilitarios.test';
    utilitarios.authorization = autorizacaoValida();
    await flushPromises();
    await page.waitForChanges();

    // Assert
    expect(fetchMock).not.toHaveBeenCalled();
    expect(nomesDoPainel(utilitarios)).toEqual(['Do Sistema']);
  });

  it('concatena os utilitários centrais aos do sistema, deduplicando por rota', async () => {
    // Arrange
    const fetchMock = jest.fn().mockImplementation(() => Promise.resolve({
      status: 200,
      json: () => Promise.resolve([
        { id: '1', nome: 'Auditoria', rota: '/auditoria', icone: 'shield', possuiPermissao: true },
        { id: '2', nome: 'Global Central', rota: '/global', icone: 'earth', possuiPermissao: true }
      ])
    }));
    setGlobalOrWindowProperty(global, 'fetch', fetchMock);

    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');

    // Act
    utilitarios.utilitarios = [{ nome: 'Do Sistema', rota: '/global', icone: 'key', possuiPermissao: true }];
    utilitarios.utilitariosHost = 'https://utilitarios.test';
    utilitarios.authorization = autorizacaoValida();
    utilitarios.buscarUtilitarios = true;
    await flushPromises();
    await page.waitForChanges();

    // Assert — sistema primeiro, central não-duplicado depois; '/global' duplicado é descartado
    expect(fetchMock.mock.calls[0][0]).toBe('https://utilitarios.test/api/utilitarios');
    expect(nomesDoPainel(utilitarios)).toEqual(['Do Sistema', 'Auditoria']);
  });

  it('resolve o host por ambiente a partir do variaveis.js (___bth) quando o prop não é informado', async () => {
    // Arrange
    setBethaEnvs({ suite: { utilitarios: { v1: { host: 'https://utilitarios.env' } } } });
    const fetchMock = jest.fn().mockImplementation(() => Promise.resolve({
      status: 200,
      json: () => Promise.resolve([{ nome: 'Central', rota: '/central', icone: 'star', possuiPermissao: true }])
    }));
    setGlobalOrWindowProperty(global, 'fetch', fetchMock);

    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');

    // Act
    utilitarios.utilitarios = [];
    utilitarios.authorization = autorizacaoValida();
    utilitarios.buscarUtilitarios = true;
    await flushPromises();
    await page.waitForChanges();

    // Assert
    expect(fetchMock.mock.calls[0][0]).toBe('https://utilitarios.env/api/utilitarios');
    expect(nomesDoPainel(utilitarios)).toEqual(['Central']);
  });

  it('renderiza os do sistema sem esperar a busca central configurada na montagem', async () => {
    // Arrange — resposta da api-utilitarios fica pendente até o teste liberar
    let responder: (resposta: any) => void;
    const fetchMock = jest.fn().mockImplementation(() => new Promise(resolve => { responder = resolve; }));
    setGlobalOrWindowProperty(global, 'fetch', fetchMock);
    setBethaEnvs({ suite: { utilitarios: { v1: { host: 'https://utilitarios.env' } } } });
    await page.setContent('');

    const utilitarios = page.doc.createElement('bth-utilitarios') as HTMLBthUtilitariosElement;
    utilitarios.utilitarios = [{ nome: 'Do Sistema', rota: '/sistema', icone: 'key', possuiPermissao: true }];
    utilitarios.authorization = autorizacaoValida();
    utilitarios.buscarUtilitarios = true;

    // Act — monta já com a busca configurada
    page.body.appendChild(utilitarios);
    // Limita a espera: se o primeiro render aguardar a API, o waitForChanges não volta.
    await Promise.race([page.waitForChanges(), new Promise<void>(resolve => setTimeout(resolve, 100))]);

    // Assert — menu do sistema renderizado com a busca ainda pendente
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(utilitarios.shadowRoot).not.toBeNull();
    expect(nomesDoPainel(utilitarios)).toEqual(['Do Sistema']);

    // Act — a api-utilitarios responde
    responder({
      status: 200,
      json: () => Promise.resolve([{ nome: 'Unificação cadastral', rota: '/unificacao', icone: 'merge', possuiPermissao: true }])
    });
    await flushPromises();
    await page.waitForChanges();

    // Assert — o item central entra depois, sem repetir os do sistema
    expect(nomesDoPainel(utilitarios)).toEqual(['Do Sistema', 'Unificação cadastral']);
  });

  it('faz fail-open exibindo apenas os do sistema quando a busca central falha', async () => {
    // Arrange
    const fetchMock = jest.fn().mockImplementation(() => Promise.resolve({ status: 500, statusText: 'erro' }));
    setGlobalOrWindowProperty(global, 'fetch', fetchMock);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');

    // Act
    utilitarios.utilitarios = [{ nome: 'Do Sistema', rota: '/sistema', icone: 'key', possuiPermissao: true }];
    utilitarios.utilitariosHost = 'https://utilitarios.test';
    utilitarios.authorization = autorizacaoValida();
    utilitarios.buscarUtilitarios = true;
    await flushPromises();
    await page.waitForChanges();

    // Assert
    expect(nomesDoPainel(utilitarios)).toEqual(['Do Sistema']);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

});
