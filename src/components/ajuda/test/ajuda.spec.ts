import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { setBethaEnvs as injectWindowBethaEnv } from '../../../../test/utils/spec.helper';
import { Ajuda } from '../ajuda';

function setupDefaultEnv() {
  let env = {
    suite: { 'central-de-ajuda': { v1: { 'host-redirecionamento': 'https://suporte.betha.cloud/' } } }
  };

  injectWindowBethaEnv(env);

  return env;
}

describe('bth-ajuda', () => {
  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({ components: [Ajuda] });
  });

  it('renderiza', async () => {
    await page.setContent('<bth-ajuda></bth-ajuda>');

    expect(page.root).not.toBeNull();
    expect(page.root).toEqualLightHtml('<bth-ajuda></bth-ajuda>');
  });

  it('exibe texto com link para central de ajuda', async () => {
    // Arrange
    setupDefaultEnv();

    // Act
    await page.setContent('<bth-ajuda></bth-ajuda>');

    // Assert
    let ajuda: HTMLBthAjudaElement = page.body.querySelector('bth-ajuda');
    expect(ajuda.shadowRoot.querySelector('bth-menu-ferramenta').getAttribute('descricao')).toEqual('Ajuda');
    expect(ajuda.shadowRoot.querySelector('bth-menu-ferramenta').getAttribute('tituloPainelLateral')).toEqual('Ajuda');
    expect(ajuda.shadowRoot.querySelector('a').textContent).toMatch(/Central de Ajuda/);
    expect(ajuda.shadowRoot.querySelector('h4').textContent).toMatch(/Está com dúvida\? Acesse a Central de Ajuda/);
  });

  it('obtem link da central de ajuda do env.js', async () => {
    // Arrange
    let env = setupDefaultEnv();

    // Act
    await page.setContent('<bth-ajuda></bth-ajuda>');

    // Assert
    let ajuda: HTMLBthAjudaElement = page.body.querySelector('bth-ajuda');
    expect(ajuda.shadowRoot.querySelector('a').href).toEqual(env.suite['central-de-ajuda'].v1['host-redirecionamento']);
  });

  it('obtem link da central de ajuda de atributos', async () => {
    // Arrange
    const centralAjudaHome = 'https://suporte.betha.cloud/';

    // Act
    await page.setContent(`<bth-ajuda central-ajuda-home="${centralAjudaHome}"></bth-ajuda>`);

    // Assert
    let ajuda: HTMLBthAjudaElement = page.body.querySelector('bth-ajuda');
    expect(ajuda.shadowRoot.querySelector('a').href).toEqual(centralAjudaHome);
  });

  it('prioriza link da central de ajuda de atributos ao invés do env.js', async () => {
    // Arrange
    setupDefaultEnv();
    const centralAjudaHome = 'https://ajuda.betha.cloud/';

    // Act
    await page.setContent(`<bth-ajuda central-ajuda-home="${centralAjudaHome}"></bth-ajuda>`);

    // Assert
    let ajuda: HTMLBthAjudaElement = page.body.querySelector('bth-ajuda');
    expect(ajuda.shadowRoot.querySelector('a').href).toEqual(centralAjudaHome);
  });

});
