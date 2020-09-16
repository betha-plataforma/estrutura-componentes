import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { setupBethaEnvs } from '../../../../test/utils/e2e.helper';
import { setupFetchMock, setupLocalStorage, setupTestingEnvs, setFetchMockData, setFetchMockStatus, getFetchMockData } from '../../../../test/utils/spec.helper';
import { getMockAuthorization } from '../../../global/test/helper/api.helper';
import { Novidades } from '../novidades';
import { FiltroNovidade } from '../novidades.interfaces';
import { construirLocalStorageKey, API_HOST, PAYLOAD } from './helper/novidades.helper';

describe('bth-novidades', () => {
  let localStorageMock: any;
  let page: SpecPage;

  beforeEach(async () => {
    setupBethaEnvs();
    setupTestingEnvs();
    setupFetchMock();

    localStorageMock = setupLocalStorage();

    page = await newSpecPage({ components: [Novidades] });
  });

  afterEach(async () => {
    // Garante que os ciclos de vidas serão chamados
    await page.setContent('');
  });

  it('renderiza', async () => {
    // Arrange
    await page.setContent('<bth-novidades></bth-novidades>');

    expect(page.root).not.toBeNull();
    expect(page.root).toEqualLightHtml('<bth-novidades></bth-novidades>');
  });


  it('exibe texto de indisponibilidade se authorization não for informado', async () => {
    // Act
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);

    // Assert
    const novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    expect(novidades.novidadesApi).toEqual(API_HOST);
    expect(novidades.authorization).toBeUndefined();
    expect(novidades.shadowRoot.textContent).toMatch(/As novidades estão temporariamente indisponíveis/);
  });

  it('exibe texto de indisponibilidade caso ocorra erro na requisição', async () => {
    // Arrange
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);
    const novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');

    // Act
    setFetchMockStatus(500);
    setFetchMockData({ detail: { message: 'Erro interno no servidor' } });

    // A troca de authorization serve como gatilho para buscar novamente os registros
    novidades.authorization = getMockAuthorization();

    await page.waitForChanges();

    // Assert
    expect(novidades.novidadesApi).toEqual(API_HOST);
    expect(novidades.authorization).toBeDefined();
    expect(novidades.shadowRoot.textContent).toMatch(/As novidades estão temporariamente indisponíveis/);
  });

  it('nao exibe texto de indisponibilidade caso authorization e endereco da api estiverem informados', async () => {
    // Arrange
    setFetchMockData([PAYLOAD]);

    // Act
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);

    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();

    // Assert
    novidades = page.body.querySelector('bth-novidades');
    expect(novidades.authorization).toBeDefined();
    expect(novidades.novidadesApi).toBeDefined();
    expect(novidades.shadowRoot.textContent).not.toMatch(/As novidades estão temporariamente indisponíveis/);
  });

  it('busca novamente ao alterar a propriedade que configura o endereço da api', async () => {
    // Arrange
    setFetchMockData([PAYLOAD]);

    // Act
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}/v1"></bth-novidades>`);

    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();

    novidades.setAttribute('novidades-api', `${API_HOST}/v2`);
    await page.waitForChanges();

    // Assert
    novidades = page.body.querySelector('bth-novidades');
    expect(novidades.authorization).toBeDefined();
    expect(novidades.novidadesApi).toBeDefined();
    expect(novidades.shadowRoot.textContent).not.toMatch(/As novidades estão temporariamente indisponíveis/);
  });

  it('busca novamente ao alterar a propriedade que configura authorization', async () => {
    // Arrange
    setFetchMockData([PAYLOAD]);

    // Act
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}/v1"></bth-novidades>`);

    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();

    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();

    // Assert
    novidades = page.body.querySelector('bth-novidades');
    expect(novidades.authorization).toBeDefined();
    expect(novidades.novidadesApi).toBeDefined();
    expect(novidades.shadowRoot.textContent).not.toMatch(/As novidades estão temporariamente indisponíveis/);
  });

  it('permite marcar todas as novidades como lidas através de link', async () => {
    // Arrange
    setFetchMockData([PAYLOAD]);

    // Act
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);

    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();

    // Assert
    novidades = page.body.querySelector('bth-novidades');

    const marcarTodasLidasLink = novidades.shadowRoot.querySelector('.marcar-todas');
    expect(marcarTodasLidasLink.textContent).toMatch(/(Marcar como lidas)|/);
  });

  it('envia evento ao marcar todas como lidas', async () => {
    // Arrange
    setFetchMockData([PAYLOAD]);

    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);
    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();

    // Act
    let marcarTodas: HTMLLinkElement = novidades.shadowRoot.querySelector('.marcar-todas > a');

    let onNaoPossuiConteudoSinalizado = jest.fn();
    novidades.addEventListener('conteudoSinalizado', onNaoPossuiConteudoSinalizado);

    marcarTodas.click();
    await page.waitForChanges();

    // Assert
    expect(onNaoPossuiConteudoSinalizado).toHaveBeenCalled();
    expect(onNaoPossuiConteudoSinalizado.mock.calls[0][0].detail).toStrictEqual({ possui: false, origem: 'novidades' });

    novidades.removeEventListener('conteudoSinalizado', onNaoPossuiConteudoSinalizado);
  });

  it('grava no local storage ao marcar todas como lidas', async () => {
    // Arrange
    setFetchMockData([PAYLOAD]);

    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);
    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();

    // Act
    let marcarTodas: HTMLLinkElement = novidades.shadowRoot.querySelector('.marcar-todas > a');
    marcarTodas.click();

    await page.waitForChanges();

    // Assert
    const key = construirLocalStorageKey(getMockAuthorization().getAuthorization().userId, PAYLOAD.id);
    expect(localStorageMock.getItem(key)).not.toBeNull();
  });

  it('define filtro de não lidas como ativo por padrão ao abrir o painel', async () => {
    // Arrange
    setFetchMockData([PAYLOAD]);

    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);

    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();

    // Act
    novidades.dispatchEvent(new CustomEvent('painelLateralShow', { detail: { show: true } }));
    await page.waitForChanges();

    // Assert
    novidades = page.body.querySelector('bth-novidades');
    const navbarPillItemAtivo: HTMLBthNavbarPillItemElement = novidades.shadowRoot.querySelector('bth-navbar-pill-item[ativo]');
    expect(navbarPillItemAtivo.getAttribute('identificador')).toMatch(FiltroNovidade.NaoLida.toString());
  });

  it('define de não lidas conforme recebido por evento "navbarPillItemClicked"', async () => {
    // Arrange
    setFetchMockData([PAYLOAD]);

    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);

    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();

    // Act
    novidades.dispatchEvent(new CustomEvent('navbarPillItemClicked', { detail: { identificador: FiltroNovidade.NaoLida.toString() } }));
    await page.waitForChanges();

    // Assert
    novidades = page.body.querySelector('bth-novidades');
    const navbarPillItemAtivo: HTMLBthNavbarPillItemElement = novidades.shadowRoot.querySelector('bth-navbar-pill-item[ativo]');
    expect(navbarPillItemAtivo.getAttribute('identificador')).toMatch(FiltroNovidade.NaoLida.toString());
  });

  it('define de lidas conforme recebido por evento "navbarPillItemClicked"', async () => {
    // Arrange
    setFetchMockData([PAYLOAD]);
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);

    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();

    // Act
    novidades.dispatchEvent(new CustomEvent('navbarPillItemClicked', { detail: { identificador: FiltroNovidade.Lida.toString() } }));
    await page.waitForChanges();

    // Assert
    novidades = page.body.querySelector('bth-novidades');
    const navbarPillItemAtivo: HTMLBthNavbarPillItemElement = novidades.shadowRoot.querySelector('bth-navbar-pill-item[ativo]');
    expect(navbarPillItemAtivo.getAttribute('identificador')).toMatch(FiltroNovidade.Lida.toString());
  });

  it('exibe lista vazia quando não houver novidades lidas', async () => {
    // Arrange
    setFetchMockData([]);

    // Act
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);
    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();

    // Assert
    novidades = page.body.querySelector('bth-novidades');
    const painelNovidades: HTMLDivElement = novidades.shadowRoot.querySelector('.painel-novidades');
    expect(painelNovidades.textContent).toMatch('Não há novidades por aqui');
  });

  it('exibe lista vazia quando não houver novidades não lidas', async () => {
    // Arrange
    setFetchMockData([]);

    // Act
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);
    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();

    // Assert
    novidades = page.body.querySelector('bth-novidades');

    const navbarPillItemAtivo: HTMLBthNavbarPillItemElement = novidades.shadowRoot.querySelector('bth-navbar-pill-item[ativo]');
    expect(navbarPillItemAtivo.getAttribute('identificador')).toMatch(FiltroNovidade.NaoLida.toString());

    const painelNovidades: HTMLDivElement = novidades.shadowRoot.querySelector('.painel-novidades');
    expect(painelNovidades.textContent).toMatch('Não há novidades por aqui');
  });

  it('exibe lista de novidades não lidas', async () => {
    // Arrange
    setFetchMockData([PAYLOAD]);

    // Act
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);
    let novidade: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidade.authorization = getMockAuthorization();
    await page.waitForChanges();

    // Assert
    const novidadeItem: HTMLBthNovidadeItemElement = novidade.shadowRoot.querySelector('bth-novidade-item');
    expect(novidadeItem).not.toBeNull();
    expect(novidadeItem.getAttribute('identificador')).toEqual(PAYLOAD.id);
  });

  it('atribui ao contador do icone do menu o número correspondente a novidades não lidas', async () => {
    // Arrange
    setFetchMockData([PAYLOAD]);

    // Act
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);
    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();

    // Assert
    // Desktop/Móvel
    const menuFerramentaIcones: NodeListOf<HTMLBthMenuFerramentaIconeElement> = novidades.shadowRoot.querySelectorAll('bth-menu-ferramenta-icone');
    menuFerramentaIcones.forEach((menuFerramentaIcone) => {
      expect(menuFerramentaIcone).not.toBeNull();
      expect(menuFerramentaIcone.getAttribute('contador')).toEqual(getFetchMockData().length.toString());
    });
  });

  it('emite evento de "possuiConteudoSinalizado" quando houver notificações pendentes', async () => {
    // Arrange
    setFetchMockData([PAYLOAD]);

    // Act
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);

    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    let onPossuiConteudoSinalizado = jest.fn();
    novidades.addEventListener('conteudoSinalizado', onPossuiConteudoSinalizado);

    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();

    // Assert
    expect(onPossuiConteudoSinalizado).toHaveBeenCalled();
    expect(onPossuiConteudoSinalizado.mock.calls[0][0].detail).toStrictEqual({ possui: true, origem: 'novidades' });

    novidades.removeEventListener('conteudoSinalizado', onPossuiConteudoSinalizado);
  });

  it('emite evento de "naoPossuiConteudoSinalizado" quando houver não notificações pendentes', async () => {
    // Arrange
    setFetchMockData([]);

    // Act
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);
    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    let onNaoPossuiConteudoSinalizado = jest.fn();
    novidades.addEventListener('conteudoSinalizado', onNaoPossuiConteudoSinalizado);

    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();

    // Assert
    expect(onNaoPossuiConteudoSinalizado).toHaveBeenCalled();
    expect(onNaoPossuiConteudoSinalizado.mock.calls[0][0].detail).toStrictEqual({ possui: false, origem: 'novidades' });

    novidades.removeEventListener('conteudoSinalizado', onNaoPossuiConteudoSinalizado);
  });

  it('abre url em nova janela ao receber evento de novidade lida', async () => {
    // Arrange
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);
    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidades.authorization = getMockAuthorization();
    await page.waitForChanges();
    const spy = jest.spyOn(window, 'open').mockImplementation();

    // Act
    novidades.dispatchEvent(new CustomEvent('novidadeLida', { detail: { id: PAYLOAD.id, url: PAYLOAD.url } }));
    await page.waitForChanges();

    // Assert
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(PAYLOAD.url, '_blank');

    spy.mockRestore();
  });

  it('emite evento que não possui conteudo sinalizado ao ler a ultima novidade pendente', async () => {
    // Arrange
    setFetchMockData([PAYLOAD]);

    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);
    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidades.authorization = getMockAuthorization();

    let onNaoPossuiConteudoSinalizado = jest.fn();
    novidades.addEventListener('conteudoSinalizado', onNaoPossuiConteudoSinalizado);

    await page.waitForChanges();

    // Act
    novidades.dispatchEvent(new CustomEvent('novidadeLida', { detail: { id: PAYLOAD.id, url: PAYLOAD.url } }));
    await page.waitForChanges();

    // Assert
    expect(onNaoPossuiConteudoSinalizado).toHaveBeenCalled();
    expect(onNaoPossuiConteudoSinalizado.mock.calls[1][0].detail).toStrictEqual({ possui: false, origem: 'novidades' });

    novidades.removeEventListener('conteudoSinalizado', onNaoPossuiConteudoSinalizado);
  });

  it('emite evento que possui conteudo sinalizado ao marcar como não lida uma novidade', async () => {
    // Arrange
    setFetchMockData([PAYLOAD]);

    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);
    let novidades: HTMLBthNovidadesElement = page.body.querySelector('bth-novidades');
    novidades.authorization = getMockAuthorization();

    let onPossuiConteudoSinalizado = jest.fn();
    novidades.addEventListener('conteudoSinalizado', onPossuiConteudoSinalizado);

    await page.waitForChanges();

    // Act
    novidades.dispatchEvent(new CustomEvent('novidadeNaoLida', { detail: { id: PAYLOAD.id } }));
    await page.waitForChanges();

    // Assert
    expect(onPossuiConteudoSinalizado).toHaveBeenCalled();
    expect(onPossuiConteudoSinalizado.mock.calls[0][0].detail).toStrictEqual({ possui: true, origem: 'novidades' });

    novidades.removeEventListener('conteudoSinalizado', onPossuiConteudoSinalizado);
  });

});

