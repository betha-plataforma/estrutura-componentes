import { SpecPage, newSpecPage } from '@stencil/core/testing';

import { setupFetchMock, setupTestingEnvs, setBethaEnvs, setFetchMockData, setFetchMockStatus, setGlobalOrWindowProperty, setupMatchingMediaQuery } from '../../../../test/utils/spec.helper';
import { getMockAuthorization } from '../../../global/test/helper/api.helper';
import { MarcaProduto } from '../marca-produto';

const PAYLOAD = {
  id: 78,
  name: 'Orquestrador',
  serviceLine: { id: 10, abbreviation: 'GEN', description: 'Genérico' },
  url: 'https://dev.betha.com.br/orquestrador',
};

describe('marca-produto', () => {
  let page: SpecPage;

  beforeEach(async () => {
    setupMatchingMediaQuery(true);

    setupTestingEnvs();

    setupFetchMock();
    setFetchMockData([]);

    page = await newSpecPage({ components: [MarcaProduto] });
  });

  it('renderiza lightdom', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto exibir-produtos></bth-marca-produto>');

    // Assert
    expect(page.root).toEqualLightHtml('<bth-marca-produto exibir-produtos=""></bth-marca-produto>');
  });

  it('reage ao evento de resize do DOM', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto></bth-marca-produto>');
    const onWindowResize = jest.spyOn(MarcaProduto.prototype, 'onWindowResize');

    // Act
    setGlobalOrWindowProperty(global, 'innerWidth', 200);
    page.win.dispatchEvent(new Event('resize'));
    await page.waitForChanges();

    // Assert
    expect(onWindowResize).toBeCalledTimes(1);
    onWindowResize.mockRestore();
  });

  it('deve renderizar nome do produto', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto></bth-marca-produto>');

    // Act
    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    const produto = 'Lorem Ipsum';
    marcaProduto.setAttribute('produto', produto);
    await page.waitForChanges();

    // Assert
    expect(marcaProduto.produto).toBe(produto);

    const header = marcaProduto.shadowRoot.querySelector('header#produto_description');
    expect(header.textContent).toBe(produto);
    expect(header.getAttribute('title')).toBe(produto);
  });

  it('nao abre dropdown ao clicar na marca/produto caso esteja configurado somente para exibir nome', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto></bth-marca-produto>');
    setBethaEnvs({ suite: { 'user-accounts': { v1: { host: 'https://api.user-accounts.betha.cloud/v1' } } } });
    setFetchMockData([PAYLOAD]);
    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    const produto = 'Lorem Ipsum';
    marcaProduto.setAttribute('produto', produto);
    marcaProduto.authorization = getMockAuthorization();

    // Act
    const marcaProdutoSection: HTMLElement = marcaProduto.shadowRoot.querySelector('.marca-produto');
    marcaProdutoSection.click();
    await page.waitForChanges();

    // Assert
    expect(marcaProdutoSection.classList.contains('marca-produto--active')).toBeFalsy();
  });

  it('deve abrir dropdown ao clicar na marca/produto', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto exibir-produtos></bth-marca-produto>');
    setBethaEnvs({ suite: { 'user-accounts': { v1: { host: 'https://api.user-accounts.betha.cloud/v1' } } } });
    setFetchMockData([PAYLOAD]);
    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    marcaProduto.authorization = getMockAuthorization();

    // Act
    const marcaProdutoSection: HTMLElement = marcaProduto.shadowRoot.querySelector('.marca-produto');
    marcaProdutoSection.click();
    await page.waitForChanges();

    // Assert
    expect(marcaProdutoSection.classList.contains('marca-produto--active')).toBeTruthy();

    const produtosDiv: HTMLDivElement = marcaProdutoSection.querySelector('.marca-produto__detalhes');
    expect(produtosDiv.classList.contains('marca-produto__detalhes--show')).toBeTruthy();
  });

  it('deve fechar dropdown ao clicar em "Fechar"', async () => {
    // Arrange
    setupMatchingMediaQuery(false);

    await page.setContent('<bth-marca-produto exibir-produtos></bth-marca-produto>');
    setBethaEnvs({ suite: { 'user-accounts': { v1: { host: 'https://api.user-accounts.betha.cloud/v1' } } } });
    setFetchMockData([PAYLOAD]);
    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    marcaProduto.authorization = getMockAuthorization();

    // Act
    const marcaProdutoSection: HTMLElement = marcaProduto.shadowRoot.querySelector('.marca-produto');

    // Abre
    marcaProdutoSection.click();
    await page.waitForChanges();

    // Mas não fecha
    marcaProdutoSection.click();
    await page.waitForChanges();

    // Assert
    expect(marcaProdutoSection.classList.contains('marca-produto--active')).toBeTruthy();
    const produtosDiv: HTMLDivElement = marcaProdutoSection.querySelector('.marca-produto__detalhes');
    expect(produtosDiv.classList.contains('marca-produto__detalhes--show')).toBeTruthy();
  });

  it('nao fecha dropdown ao clicar no corpo em dispositivos moveis', async () => {
    // Arrange
    setupMatchingMediaQuery(false);

    await page.setContent('<bth-marca-produto exibir-produtos></bth-marca-produto>');
    setBethaEnvs({ suite: { 'user-accounts': { v1: { host: 'https://api.user-accounts.betha.cloud/v1' } } } });
    setFetchMockData([PAYLOAD]);
    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    marcaProduto.authorization = getMockAuthorization();

    // Act
    const fechar: HTMLButtonElement = marcaProduto.shadowRoot.querySelector('.marca-produto__detalhes-solucoes__header button');
    fechar.click();
    await page.waitForChanges();

    // Assert
    expect(fechar.classList.contains('marca-produto--active')).toBeFalsy();

    const produtosDiv: HTMLDivElement = marcaProduto.shadowRoot.querySelector('.marca-produto__detalhes');
    expect(produtosDiv.classList.contains('marca-produto__detalhes--show')).toBeFalsy();
  });

  it('exibe indisponibilidade se não for possível obter endereço da api', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto></bth-marca-produto>');
    setBethaEnvs({});
    setFetchMockData([PAYLOAD]);

    // Act
    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    marcaProduto.authorization = getMockAuthorization();
    marcaProduto.setAttribute('exibir-produtos', 'true');
    await page.waitForChanges();

    // Assert
    expect(marcaProduto.shadowRoot.textContent).toMatch(/A seleção de produtos está temporariamente indisponível/);
  });

  it('exibe indisponibilidade se authorization não for informado', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto></bth-marca-produto>');
    setBethaEnvs({ suite: { 'user-accounts': { v1: { host: 'https://api.user-accounts.betha.cloud/v1' } } } });
    setFetchMockData([PAYLOAD]);

    // Act
    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    marcaProduto.authorization = undefined;
    marcaProduto.setAttribute('exibir-produtos', 'true');
    await page.waitForChanges();

    // Assert
    expect(marcaProduto.shadowRoot.textContent).toMatch(/A seleção de produtos está temporariamente indisponível/);
  });

  it('exibe indisponibilidade ao falhar requisição para a api', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto></bth-marca-produto>');
    setBethaEnvs({ suite: { 'user-accounts': { v1: { host: 'https://api.user-accounts.betha.cloud/v1' } } } });
    setFetchMockStatus(500);
    setFetchMockData({ detail: { message: 'Erro interno no servidor' } });

    // Act
    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    marcaProduto.authorization = getMockAuthorization();
    marcaProduto.setAttribute('exibir-produtos', 'true');

    await page.waitForChanges();

    // Assert
    expect(marcaProduto.shadowRoot.textContent).toMatch(/A seleção de produtos está temporariamente indisponível/);
  });

  it('exibe lista de produtos caso configurado para exibir produtos (api através do env.js)', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto></bth-marca-produto>');
    setBethaEnvs({ suite: { 'user-accounts': { v1: { host: 'https://api.user-accounts.betha.cloud/v1' } } } });
    setFetchMockData([PAYLOAD]);

    // Act
    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    marcaProduto.authorization = getMockAuthorization();
    marcaProduto.setAttribute('exibir-produtos', 'true');
    await page.waitForChanges();

    // Assert
    expect(marcaProduto.shadowRoot.textContent).not.toMatch(/A seleção de produtos está temporariamente indisponível/);

    const sistema: HTMLLIElement = marcaProduto.shadowRoot.querySelector('li[id^=marca_produto_item_]');
    expect(sistema).not.toBeUndefined();
  });

  it('exibe lista de produtos caso configurado para exibir produtos (api através de atributo)', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto></bth-marca-produto>');
    setBethaEnvs({});
    setFetchMockData([PAYLOAD]);

    // Act
    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    marcaProduto.authorization = getMockAuthorization();
    marcaProduto.userAccountsApi = 'https://api.user-accounts.betha.cloud/v1';
    marcaProduto.setAttribute('exibir-produtos', 'true');
    await page.waitForChanges();

    // Assert
    expect(marcaProduto.shadowRoot.textContent).not.toMatch(/A seleção de produtos está temporariamente indisponível/);

    const sistema: HTMLLIElement = marcaProduto.shadowRoot.querySelector('li[id^=marca_produto_item_]');
    expect(sistema).not.toBeUndefined();
  });


  it('abre página do produto ao clicar sobre botao do produto', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto></bth-marca-produto>');
    setBethaEnvs({ suite: { 'user-accounts': { v1: { host: 'https://api.user-accounts.betha.cloud/v1' } } } });
    setFetchMockData([PAYLOAD]);
    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    marcaProduto.authorization = getMockAuthorization();
    marcaProduto.setAttribute('exibir-produtos', 'true');
    await page.waitForChanges();

    // Act
    const spy = jest.spyOn(window, 'open').mockImplementation();
    const produto: HTMLButtonElement = marcaProduto.shadowRoot.querySelector('.bth__card');
    produto.click();

    // Assert
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(PAYLOAD.url, '_blank');

    spy.mockRestore();
  });

  it('exibe lista vazia caso nenhum produto estiver disponível', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto></bth-marca-produto>');
    setBethaEnvs({ suite: { 'user-accounts': { v1: { host: 'https://api.user-accounts.betha.cloud/v1' } } } });
    setFetchMockData([]);

    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    marcaProduto.authorization = getMockAuthorization();

    // Act
    marcaProduto.setAttribute('exibir-produtos', 'true');
    await page.waitForChanges();

    // Assert
    expect(marcaProduto.shadowRoot.textContent).toMatch(/Conheça outros produtos disponíveis/);
  });

  it('exibe link p/ acesso a store quando a lista estiver vazia (através do env.js)', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto></bth-marca-produto>');
    const suiteUrl = 'https://suite.betha.cloud';
    const storeUrl = 'https://betha.store';
    setBethaEnvs({
      suite: {
        'user-accounts': { v1: { host: 'https://api.user-accounts.betha.cloud/v1' } },
        'studio-ui': { v1: { store: storeUrl } },
        'suite-ui': { home: { host: suiteUrl } }
      }
    });
    setFetchMockData([]);

    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    marcaProduto.authorization = getMockAuthorization();

    // Act
    marcaProduto.setAttribute('exibir-produtos', 'true');
    await page.waitForChanges();

    // Assert
    const containerEmptyStates: HTMLDivElement = marcaProduto.shadowRoot.querySelector('.empty-state-container');
    const storeLink: NodeListOf<HTMLAnchorElement> = containerEmptyStates.querySelectorAll('a');
    expect(storeLink[0].href).toMatch(new RegExp(suiteUrl, 'ig'));
    expect(storeLink[1].href).toMatch(new RegExp(storeUrl, 'ig'));
  });

  it('exibe link p/ acesso a store quando a lista estiver vazia (através de atributo)', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto></bth-marca-produto>');
    setFetchMockData([]);

    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    marcaProduto.authorization = getMockAuthorization();

    const suiteUrl = 'https://suite.betha.cloud';
    const storeUrl = 'https://betha.store';
    marcaProduto.storeHome = storeUrl;

    // Act
    marcaProduto.setAttribute('exibir-produtos', 'true');
    await page.waitForChanges();

    // Assert
    const containerEmptyStates: HTMLDivElement = marcaProduto.shadowRoot.querySelector('.empty-state-container');
    const storeLink: NodeListOf<HTMLAnchorElement> = containerEmptyStates.querySelectorAll('a');
    expect(storeLink[0].href).toMatch(new RegExp(suiteUrl, 'ig'));
    expect(storeLink[1].href).toMatch(new RegExp(storeUrl, 'ig'));
  });

  it('exibe link p/ suite de produtos ao clicar em "Mais Produtos" (url através do env.js)', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto></bth-marca-produto>');
    const suiteUrl = 'https://suite.betha.cloud';
    setBethaEnvs({
      suite: {
        'user-accounts': { v1: { host: 'https://api.user-accounts.betha.cloud/v1' } },
        'suite-ui': { home: { host: suiteUrl } }
      }
    });
    setFetchMockData([PAYLOAD]);

    // Act
    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    marcaProduto.authorization = getMockAuthorization();
    marcaProduto.setAttribute('exibir-produtos', 'true');
    await page.waitForChanges();

    // Assert
    const verTodos: HTMLAnchorElement = marcaProduto.shadowRoot.querySelector('.marca-produto__detalhes-solucoes__header a');
    expect(verTodos.href).toMatch(new RegExp(suiteUrl, 'ig'));
  });

  it('exibe link p/ suite de produtos ao clicar em "Mais Produtos" (url através de atributo)', async () => {
    // Arrange
    await page.setContent('<bth-marca-produto></bth-marca-produto>');

    setBethaEnvs({
      suite: {
        'user-accounts': { v1: { host: 'https://api.user-accounts.betha.cloud/v1' } },
      }
    });
    setFetchMockData([PAYLOAD]);

    // Act
    const marcaProduto: HTMLBthMarcaProdutoElement = page.doc.querySelector('bth-marca-produto');
    marcaProduto.authorization = getMockAuthorization();
    marcaProduto.setAttribute('exibir-produtos', 'true');

    const suiteUrl = 'https://suite.betha.cloud';
    marcaProduto.suiteHome = suiteUrl;

    await page.waitForChanges();

    // Assert
    const verTodos: HTMLAnchorElement = marcaProduto.shadowRoot.querySelector('.marca-produto__detalhes-solucoes__header a');
    expect(verTodos.href).toMatch(new RegExp(suiteUrl, 'ig'));
  });

});
