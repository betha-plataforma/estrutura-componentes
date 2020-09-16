import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { NavbarPillGroup } from '../navbar-pill-group';

describe('navbar-pill-group', () => {
  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({ components: [NavbarPillGroup] });
  });

  it('renderiza light dom', async () => {
    // Arrange
    await page.setContent('<bth-navbar-pill-group></bth-navbar-pill-group>');

    // Assert
    expect(page.root).toEqualLightHtml('<bth-navbar-pill-group></bth-navbar-pill-group>');
  });

  it('renderiza slot shadow dom', async () => {
    // Arrange
    await page.setContent('<bth-navbar-pill-group></bth-navbar-pill-group>');

    // Act
    const navBarGroup: HTMLBthNavbarPillGroupElement = page.doc.querySelector('bth-navbar-pill-group');
    var conteudo = 'Conteúdo qualquer';
    navBarGroup.innerHTML = `<h1>${conteudo}</h1>`;
    await page.waitForChanges();

    // Assert
    expect(navBarGroup.querySelector('h1').textContent).toBe(conteudo);
  });

  it('deve ter aria-label conforme descricao', async () => {
    // Arrange
    await page.setContent('<bth-navbar-pill-group></bth-navbar-pill-group>');

    // Act
    const navBarGroup: HTMLBthNavbarPillGroupElement = page.doc.querySelector('bth-navbar-pill-group');
    const descricao = 'Lorem Ipsum';
    navBarGroup.setAttribute('descricao', descricao);
    await page.waitForChanges();

    // Assert
    expect(navBarGroup.descricao).toBe(descricao);

    const nav = navBarGroup.shadowRoot.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe(`Navegação por filtros ${descricao.toLowerCase()}`);
  });

});
