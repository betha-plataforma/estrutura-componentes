import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { Icone } from '../icone';


describe('icone', () => {
  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({ components: [Icone] });
  });

  it('renderiza light dom', async () => {
    // Arrange
    await page.setContent('<bth-icone></bth-icone>');

    // Act
    const icone: HTMLBthIconeElement = page.doc.querySelector('bth-icone');
    icone.setAttribute('icone', 'cloud');
    await page.waitForChanges();

    // Assert
    expect(page.root).toEqualLightHtml('<bth-icone aria-label="cloud" cor="inherit" icone="cloud" role="img" tamanho="inherit"></bth-icone>');
  });

  it('renderiza icone', async () => {
    // Arrange
    await page.setContent('<bth-icone></bth-icone>');

    // Act
    const icone: HTMLBthIconeElement = page.doc.querySelector('bth-icone');
    const materialIconRef = 'cloud';
    icone.setAttribute('icone', materialIconRef);
    await page.waitForChanges();

    // Assert
    expect(icone.icone).toBe(materialIconRef);

    const iconElement = icone.shadowRoot.querySelector('i');
    expect(iconElement.classList.contains(`mdi-${materialIconRef}`)).toBeTruthy();
  });

  it('customiza cor do icone', async () => {
    // Arrange
    await page.setContent('<bth-icone></bth-icone>');

    // Act
    const icone: HTMLBthIconeElement = page.doc.querySelector('bth-icone');
    const cor = '#fff';
    icone.setAttribute('icone', 'cloud');
    icone.setAttribute('cor', cor);
    await page.waitForChanges();

    // Assert
    expect(icone.cor).toBe(cor);

    const iconElement = icone.shadowRoot.querySelector('i');
    expect(iconElement.style.color).toEqual(cor);
  });

  it('customiza tamanho do icone', async () => {
    // Arrange
    await page.setContent('<bth-icone></bth-icone>');

    // Act
    const icone: HTMLBthIconeElement = page.doc.querySelector('bth-icone');
    const tamanho = '25px';
    icone.setAttribute('icone', 'cloud');
    icone.setAttribute('tamanho', tamanho);
    await page.waitForChanges();

    // Assert
    expect(icone.tamanho).toBe(tamanho);

    const iconElement = icone.shadowRoot.querySelector('i');
    expect(iconElement.style.fontSize).toEqual(tamanho);
  });

  it('define aria-label default caso nao informado', async () => {
    // Arrange
    await page.setContent('<bth-icone></bth-icone>');

    // Act
    const icone: HTMLBthIconeElement = page.doc.querySelector('bth-icone');
    icone.setAttribute('icone', 'cloud');
    await page.waitForChanges();

    // Assert
    expect(icone.getAttribute('aria-label')).toBe('cloud');
  });

  it('permite informar aria-label', async () => {
    // Arrange
    await page.setContent('<bth-icone></bth-icone>');

    // Act
    const icone: HTMLBthIconeElement = page.doc.querySelector('bth-icone');
    const ariaLabel = 'Label para ícone';
    icone.setAttribute('icone', 'cloud');
    icone.setAttribute('aria-label', ariaLabel);
    await page.waitForChanges();

    // Assert
    expect(icone.getAttribute('aria-label')).toBe(ariaLabel);
  });

});
