import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { NavbarPillItem } from '../navbar-pill-item';

describe('navbar-pill-item', () => {
  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({ components: [NavbarPillItem] });
  });

  it('renderiza light dom', async () => {
    // Arrange
    await page.setContent('<bth-navbar-pill-item></bth-navbar-pill-item>');

    // Assert
    expect(page.root).toEqualLightHtml('<bth-navbar-pill-item></bth-navbar-pill-item>');
  });

  it('renderiza com descrição', async () => {
    // Arrange
    await page.setContent('<bth-navbar-pill-item></bth-navbar-pill-item>');

    // Act
    const navbarPillItem: HTMLBthNavbarPillItemElement = page.doc.querySelector('bth-navbar-pill-item');
    const descricao = 'Descrição';
    navbarPillItem.setAttribute('descricao', descricao);
    await page.waitForChanges();

    // Assert
    expect(navbarPillItem.getAttribute('descricao')).toBe(descricao);

    const descritor: HTMLSpanElement = navbarPillItem.shadowRoot.querySelector('.descricao');
    expect(descritor.textContent).toBe(descricao);
  });

  it('renderiza com totalizador', async () => {
    // Arrange
    await page.setContent('<bth-navbar-pill-item></bth-navbar-pill-item>');

    // Act
    const navbarPillItem: HTMLBthNavbarPillItemElement = page.doc.querySelector('bth-navbar-pill-item');
    const totalizador = 37;
    navbarPillItem.setAttribute('totalizador', totalizador.toString());
    await page.waitForChanges();

    // Assert
    expect(navbarPillItem.getAttribute('totalizador')).toBe(totalizador.toString());

    const total: HTMLSpanElement = navbarPillItem.shadowRoot.querySelector('.totalizador');
    expect(total.textContent).toBe(`(${totalizador})`);
  });

  it('renderiza ativo', async () => {
    // Arrange
    await page.setContent('<bth-navbar-pill-item></bth-navbar-pill-item>');

    // Act
    const navbarPillItem: HTMLBthNavbarPillItemElement = page.doc.querySelector('bth-navbar-pill-item');
    navbarPillItem.setAttribute('ativo', 'true');
    await page.waitForChanges();

    // Assert
    expect(navbarPillItem.ativo).toBe(true);

    const block: HTMLDivElement = navbarPillItem.shadowRoot.querySelector('.navbar-pill-item');
    expect(block.classList.contains('navbar-pill-item--active')).toBeTruthy();
  });

  it('emite evento ao ser selecionado', async () => {
    // Arrange
    await page.setContent('<bth-navbar-pill-item></bth-navbar-pill-item>');

    // Act
    const navbarPillItem: HTMLBthNavbarPillItemElement = page.doc.querySelector('bth-navbar-pill-item');
    const navbarPillItemId = 'pillId1';

    navbarPillItem.setAttribute('identificador', navbarPillItemId);

    let onNavbarPillItemClicked = jest.fn();
    navbarPillItem.addEventListener('navbarPillItemClicked', onNavbarPillItemClicked);

    const navbarPillLink: HTMLAnchorElement = navbarPillItem.shadowRoot.querySelector('a');
    navbarPillLink.click();
    await page.waitForChanges();

    // Assert
    expect(onNavbarPillItemClicked).toHaveBeenCalled();
    expect(onNavbarPillItemClicked.mock.calls[0][0].detail).toStrictEqual({
      identificador: navbarPillItemId,
    });
  });

});
