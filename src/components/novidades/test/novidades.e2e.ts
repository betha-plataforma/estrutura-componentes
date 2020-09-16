import { newE2EPage, E2EPage, E2EElement } from '@stencil/core/testing';

import { setupBethaEnvs, setupTestingEnvs, setupFetch, setupLocalStorage } from '../../../../test/utils/e2e.helper';
import { setupAuthorization } from '../../../global/test/helper/api.e2e.helper';
import { FiltroNovidade } from '../novidades.interfaces';
import { injectAuthorization, expectFiltroAtivoPorDescricao as expectFiltroAtivo, selectFiltroLidas } from './helper/novidades.e2e.helper';
import { PAYLOAD, API_HOST } from './helper/novidades.helper';

describe('novidades', () => {

  it('renderiza', async () => {
    const page = await newE2EPage();
    await page.setContent('<bth-novidades></bth-novidades>');

    const element = await page.find('bth-novidades');
    expect(element).toHaveClass('hydrated');
  });

  let page: E2EPage;

  beforeEach(async () => {
    page = await newE2EPage();
    page.evaluateOnNewDocument(setupTestingEnvs);
    page.evaluateOnNewDocument(setupBethaEnvs);
    page.evaluateOnNewDocument(setupFetch);
    page.evaluateOnNewDocument(setupLocalStorage);
    page.evaluateOnNewDocument(setupAuthorization);
  });

  it('deve exibir lista de novidades não lidas', async () => {
    // Arrange
    page.evaluateOnNewDocument(PAYLOAD => {
      // @ts-ignore
      window.___testing.fetch = { responseData: [PAYLOAD] };
    }, PAYLOAD);

    // Act
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);
    page.evaluate(injectAuthorization);
    await page.waitForChanges();

    // Assert
    const navbarPillItens: E2EElement[] = await page.findAll('bth-novidades >>> bth-navbar-pill-item');
    expectFiltroAtivo(navbarPillItens, FiltroNovidade.NaoLida);

    const novidadeItem: E2EElement = await page.find('bth-novidades >>> bth-novidade-item');
    expect(novidadeItem).not.toBeNull();

    const identificadorNovidadeItem = await novidadeItem.getProperty('identificador');
    expect(identificadorNovidadeItem).toEqual(PAYLOAD.id);
  });

  it('deve exibir lista de novidades lidas', async () => {
    // Arrange
    page.evaluateOnNewDocument(PAYLOAD => {
      // @ts-ignore
      window.___testing.fetch = { responseData: [PAYLOAD] };
      // @ts-ignore
      // Define como lida no localStorage
      localStorage.setItem([`novidades_${window.authorization.getAuthorization().userId}_${PAYLOAD.id}`], true);
    }, PAYLOAD);

    // Act
    await page.setContent(`<bth-novidades novidades-api="${API_HOST}"></bth-novidades>`);
    page.evaluate(injectAuthorization);
    await page.waitForChanges();
    page.evaluate(selectFiltroLidas);
    await page.waitForChanges();

    // Assert
    const navbarPillItem: E2EElement[] = await page.findAll('bth-novidades >>> bth-navbar-pill-item');
    expectFiltroAtivo(navbarPillItem, FiltroNovidade.Lida);

    const novidadeItem = await page.find('bth-novidades >>> bth-novidade-item');
    expect(novidadeItem).not.toBeNull();

    const identificadorNovidadeItem = await novidadeItem.getProperty('identificador');
    expect(identificadorNovidadeItem).toEqual(PAYLOAD.id);
  });

});
