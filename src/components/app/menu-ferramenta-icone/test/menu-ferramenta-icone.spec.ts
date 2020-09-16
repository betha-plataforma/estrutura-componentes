import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { MenuFerramentaIcone } from '../menu-ferramenta-icone';

describe('menu-ferramenta-icone', () => {
  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({ components: [MenuFerramentaIcone] });
  });

  it('renderiza light dom', async () => {
    // Arrange
    await page.setContent('<bth-menu-ferramenta-icone></bth-menu-ferramenta-icone>');

    // Assert
    expect(page.root).toEqualLightHtml('<bth-menu-ferramenta-icone></bth-menu-ferramenta-icone>');
  });

  it('renderiza desktop', async () => {
    // Arrange
    await page.setContent('<bth-menu-ferramenta-icone></bth-menu-ferramenta-icone>');

    // Act
    const menuFerramentaIcone: HTMLBthMenuFerramentaIconeElement = page.doc.querySelector('bth-menu-ferramenta-icone');
    menuFerramentaIcone.icone = 'cloud';

    await page.waitForChanges();

    // Assert
    expect(menuFerramentaIcone.icone).toBe('cloud');
    expect(menuFerramentaIcone.mobile).toBe(false);
    expect(menuFerramentaIcone.contador).toBe(0);

    const block: HTMLDivElement = menuFerramentaIcone.shadowRoot.querySelector('div');
    expect(block.classList.contains('desktop')).toBeTruthy();

    const icone: HTMLBthIconeElement = menuFerramentaIcone.shadowRoot.querySelector('bth-icone');
    expect(icone.getAttribute('icone')).toBe('cloud');
  });

  it('renderiza desktop', async () => {
    // Arrange
    await page.setContent('<bth-menu-ferramenta-icone></bth-menu-ferramenta-icone>');

    // Act
    const menuFerramentaIcone: HTMLBthMenuFerramentaIconeElement = page.doc.querySelector('bth-menu-ferramenta-icone');
    menuFerramentaIcone.mobile = true;

    await page.waitForChanges();

    // Assert
    expect(menuFerramentaIcone.icone).toBe('cloud');
    expect(menuFerramentaIcone.mobile).toBe(true);
    expect(menuFerramentaIcone.contador).toBe(0);

    const block: HTMLDivElement = menuFerramentaIcone.shadowRoot.querySelector('div');
    expect(block.classList.contains('mobile')).toBeTruthy();

    const icone: HTMLBthIconeElement = menuFerramentaIcone.shadowRoot.querySelector('bth-icone');
    expect(icone.getAttribute('icone')).toBe('cloud');
  });

  it('renderiza contador menor que 100', async () => {
    // Arrange
    await page.setContent('<bth-menu-ferramenta-icone></bth-menu-ferramenta-icone>');

    // Act
    const menuFerramentaIcone: HTMLBthMenuFerramentaIconeElement = page.doc.querySelector('bth-menu-ferramenta-icone');
    const valorContador = 99;
    menuFerramentaIcone.contador = valorContador;
    await page.waitForChanges();

    // Assert
    expect(menuFerramentaIcone.contador).toBe(valorContador);

    const badge: HTMLSpanElement = menuFerramentaIcone.shadowRoot.querySelector('.badge');
    expect(badge.textContent).toBe(valorContador.toString());
  });

  it('renderiza contador maior igual 100', async () => {
    // Arrange
    await page.setContent('<bth-menu-ferramenta-icone></bth-menu-ferramenta-icone>');

    // Act
    const menuFerramentaIcone: HTMLBthMenuFerramentaIconeElement = page.doc.querySelector('bth-menu-ferramenta-icone');
    const valorContador = 100;
    menuFerramentaIcone.contador = valorContador;
    await page.waitForChanges();

    // Assert
    expect(menuFerramentaIcone.contador).toBe(valorContador);

    const badge: HTMLSpanElement = menuFerramentaIcone.shadowRoot.querySelector('.badge');
    expect(badge.textContent).toBe('99+');
  });

});
