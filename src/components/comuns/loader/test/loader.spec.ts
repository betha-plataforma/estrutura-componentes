import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { Loader } from '../loader';

describe('navbar-pill-group', () => {
  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({ components: [Loader] });
  });

  it('renderiza light dom', async () => {
    // Arrange
    await page.setContent('<bth-loader></bth-loader>');

    // Assert
    expect(page.root).toEqualLightHtml('<bth-loader></bth-loader>');
  });

  it('renderiza inline', async () => {
    // Arrange
    await page.setContent('<bth-loader></bth-loader>');

    // Act
    const loader: HTMLBthLoaderElement = page.doc.querySelector('bth-loader');
    loader.setAttribute('inline', 'true');
    await page.waitForChanges();

    // Assert
    const block: HTMLDivElement = loader.shadowRoot.querySelector('.loader');
    expect(block.classList.contains('loader--inline')).toBeTruthy();
  });

});
