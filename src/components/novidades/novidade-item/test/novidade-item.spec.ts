import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { getDataHoraDescrita } from '../../../../utils/date';
import { PAYLOAD } from '../../test/helper/novidades.helper';
import { NovidadeItem } from '../novidade-item';


describe('novidade-item', () => {
  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({
      components: [NovidadeItem]
    });

    await page.setContent(`
      <bth-novidade-item
        identificador="${PAYLOAD.id}"
        titulo="${PAYLOAD.titulo}"
        mensagem="${PAYLOAD.mensagem}"
        url="${PAYLOAD.url}"
        data-hora="${PAYLOAD.dataInicial}">
      </bth-novidade-item>
    `);
  });

  it('renderiza', async () => {
    expect(page.root).not.toBeNull();
    expect(page.root).toEqualLightHtml(`
      <bth-novidade-item
        data-hora="2020-04-22T17:03:28"
        identificador="5ea0a54de26fa800638a91e5"
        mensagem="Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fuga tempora reiciendis, quidem a debitis, omnis, officia facilis at dolor architecto est? Nobis atque cumque dicta."
        titulo="Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab, rem!"
        url="http://www.google.com.br">
      </bth-novidade-item>
      `);
  });

  it('exibe titulo corretamente', async () => {
    // Act
    page.root.setAttribute('is-lida', 'true');
    await page.waitForChanges();

    // Assert
    expect(page.root.shadowRoot.querySelector('h5').textContent).toEqual(PAYLOAD.titulo);
  });

  it('exibe mensagem corretamente', async () => {
    // Act
    page.root.setAttribute('is-lida', 'true');
    await page.waitForChanges();

    // Assert
    expect(page.root.shadowRoot.querySelector('p').textContent).toEqual(PAYLOAD.mensagem);
  });

  it('exibe data formatada', async () => {
    // Act
    page.root.setAttribute('is-lida', 'true');
    await page.waitForChanges();

    // Assert
    expect(page.root.shadowRoot.querySelector('.float-right').textContent).toEqual(getDataHoraDescrita(PAYLOAD.dataInicial));
  });

  it('permite através de link acessar a url da novidade', async () => {
    // Act
    page.root.setAttribute('is-lida', 'true');
    await page.waitForChanges();

    // Assert
    expect((page.root.shadowRoot.querySelector('a[title="Mais detalhes"]') as HTMLAnchorElement).href).toMatch(PAYLOAD.url);
  });

  it('exibe marcar como lida para novidades nao lidas', async () => {
    // Act
    page.root.setAttribute('is-lida', 'true');
    await page.waitForChanges();

    // Assert
    expect(page.root.shadowRoot.querySelector('a[title="Marcar como não lida"]')).not.toBeNull();
  });

  it('exibe marcar como não lida para novidades lidas', async () => {
    // Arrange
    page.root.setAttribute('is-lida', 'false');
    await page.waitForChanges();

    expect(page.root.shadowRoot.querySelector('a[title="Marcar como lida"]')).not.toBeNull();
  });

  it('emite evento "novidadeLida" ao clicar no icone de uma novidade não lida', async () => {
    // Arrange
    page.root.setAttribute('is-lida', 'false');
    await page.waitForChanges();

    const marcarLida: HTMLLinkElement = page.root.shadowRoot.querySelector('a[title="Marcar como lida"]');
    let onNovidadeLida = jest.fn();
    page.root.addEventListener('novidadeLida', onNovidadeLida);
    await page.waitForChanges();

    // Act
    marcarLida.click();
    await page.waitForChanges();

    // Assert
    expect(marcarLida).not.toBeNull();
    expect(onNovidadeLida).toHaveBeenCalled();

    page.root.removeEventListener('novidadeLida', onNovidadeLida);
  });

  it('emite evento "novidadeNaoLida" ao clicar no icone de uma novidade lida', async () => {
    // Arrange
    page.root.setAttribute('is-lida', 'true');
    await page.waitForChanges();

    const marcarNaoLida: HTMLLinkElement = page.root.shadowRoot.querySelector('a[title="Marcar como não lida"]');
    let onNovidadeNaoLida = jest.fn();
    page.root.addEventListener('novidadeNaoLida', onNovidadeNaoLida);
    await page.waitForChanges();

    // Act
    marcarNaoLida.click();
    await page.waitForChanges();

    // Assert
    expect(marcarNaoLida).not.toBeNull();
    expect(onNovidadeNaoLida).toHaveBeenCalled();

    page.root.removeEventListener('novidadeNaoLida', onNovidadeNaoLida);
  });

});
