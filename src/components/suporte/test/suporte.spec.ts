import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { Suporte } from '../suporte';

describe('suporte', () => {
  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({ components: [Suporte] });
  });

  it('renderiza light dom', async () => {
    // Arrange
    await page.setContent('<bth-suporte></bth-suporte>');

    // Assert
    expect(page.root).toEqualLightHtml('<bth-suporte></bth-suporte>');
  });

  it('renderiza icone desktop', async () => {
    // Act
    await page.setContent('<bth-suporte></bth-suporte>');
    const suporte: HTMLBthSuporteElement = page.doc.querySelector('bth-suporte');

    // Assert
    expect(suporte).not.toBeNull();

    expect(suporte.shadowRoot.querySelector('bth-menu-ferramenta').getAttribute('descricao')).toEqual('Suporte');
    expect(suporte.shadowRoot.querySelector('bth-menu-ferramenta').getAttribute('tituloPainelLateral')).toEqual('Suporte');

    const menuFerramentaIcone: HTMLBthMenuFerramentaIconeElement = suporte.shadowRoot.querySelector('[slot=menu_item_desktop]');
    expect(menuFerramentaIcone).not.toBeNull();
    expect(menuFerramentaIcone.getAttribute('icone')).toBe('headset');

    const menuFerramentaDescricao: HTMLBthMenuFerramentaIconeElement = suporte.shadowRoot.querySelector('[slot=menu_descricao_desktop]');
    expect(menuFerramentaDescricao).not.toBeNull();
    expect(menuFerramentaDescricao.textContent).toBe('Suporte');
  });

  it('renderiza icone mobile', async () => {
    // Act
    await page.setContent('<bth-suporte></bth-suporte>');
    const suporte: HTMLBthSuporteElement = page.doc.querySelector('bth-suporte');

    // Assert
    expect(suporte).not.toBeNull();

    expect(suporte.shadowRoot.querySelector('bth-menu-ferramenta').getAttribute('descricao')).toEqual('Suporte');
    expect(suporte.shadowRoot.querySelector('bth-menu-ferramenta').getAttribute('tituloPainelLateral')).toEqual('Suporte');

    const menuFerramentaIcone: HTMLBthMenuFerramentaIconeElement = suporte.shadowRoot.querySelector('[slot=menu_item_mobile]');
    expect(menuFerramentaIcone).not.toBeNull();
    expect(menuFerramentaIcone.getAttribute('icone')).toBe('headset');

    const menuFerramentaDescricao: HTMLBthMenuFerramentaIconeElement = suporte.shadowRoot.querySelector('[slot=menu_descricao_mobile]');
    expect(menuFerramentaDescricao).not.toBeNull();
    expect(menuFerramentaDescricao.textContent).toBe('Suporte');
  });

  it('renderiza item do painel lateral se blip chat ativo', async () => {
    // Arrange
    await page.setContent('<bth-suporte></bth-suporte>');
    const suporte: HTMLBthSuporteElement = page.doc.querySelector('bth-suporte');

    // Act
    suporte.blipChat = true;
    await page.waitForChanges();

    // Assert
    const blipChatButton: HTMLAnchorElement = suporte.shadowRoot.querySelector('[slot=conteudo_painel_lateral] a');
    expect(blipChatButton.textContent).toBe('Suporte via chat');
    expect(blipChatButton.getAttribute('disabled')).toBeNull();
    expect(blipChatButton.getAttribute('aria-disabled')).toBe('false');
    expect(blipChatButton.getAttribute('aria-label')).toBe('Acessar o chat do suporte');

    const iconeUtilitario: HTMLBthIconeElement = blipChatButton.querySelector('bth-icone');
    expect(iconeUtilitario.getAttribute('icone')).toBe('message-outline');
  });

  it('não renderiza item do painel lateral se blip chat inativo', async () => {
    // Arrange
    await page.setContent('<bth-suporte></bth-suporte>');
    const suporte: HTMLBthSuporteElement = page.doc.querySelector('bth-suporte');

    // Act
    suporte.blipChat = false;
    await page.waitForChanges();

    // Assert
    const blipChatButton: HTMLAnchorElement = suporte.shadowRoot.querySelector('[slot=conteudo_painel_lateral] a[title=\'Suporte via chat\']');
    expect(blipChatButton).toBeNull();
  });

  it('exibe badge de status online na anchor do painel lateral', async () => {
    // Arrange
    await page.setContent('<bth-suporte></bth-suporte>');
    const suporte: HTMLBthSuporteElement = page.doc.querySelector('bth-suporte');

    // Act
    Date.now = jest.fn(() => Date.parse('2022-01-01 13:31:00'));
    suporte.blipChat = true;
    suporte.blipChatUserInfo = {
      id: 'ola', nome: 'ola', email: 'ola@gmail.com'
    };
    await page.waitForChanges();

    // Assert
    const blipChatButton: HTMLAnchorElement = suporte.shadowRoot.querySelector('[slot=conteudo_painel_lateral] a[title=\'Suporte via chat\']');
    const status: HTMLSpanElement = blipChatButton.querySelector('.status');
    expect(status.textContent).toBe('Online');
  });

  it('exibe badge de status offline na anchor do painel lateral', async () => {
    // Arrange
    await page.setContent('<bth-suporte></bth-suporte>');
    const suporte: HTMLBthSuporteElement = page.doc.querySelector('bth-suporte');

    // Act
    Date.now = jest.fn(() => Date.parse('2022-01-01 00:00:00'));
    suporte.blipChat = true;
    suporte.blipChatUserInfo = {
      id: 'ola', nome: 'ola', email: 'ola@gmail.com'
    };
    await page.waitForChanges();

    // Assert
    const blipChatButton: HTMLAnchorElement = suporte.shadowRoot.querySelector('[slot=conteudo_painel_lateral] a[title=\'Suporte via chat\']');
    const status: HTMLSpanElement = blipChatButton.querySelector('.status');
    // console.warn(status);
    expect(status).toBeNull();
  });

  it('exibe badge de mensagens não vistas na anchor do painel lateral', async () => {
    // Arrange
    await page.setContent('<bth-suporte></bth-suporte>');
    const suporte: HTMLBthSuporteElement = page.doc.querySelector('bth-suporte');

    // Act
    suporte.blipChat = true;
    suporte.blipChatUserInfo = {
      id: 'ola', nome: 'ola', email: 'ola@gmail.com'
    };
    suporte.handleWindowMessage({ event: 'BLIP_WEBCHAT_NOTIFICATION', pendingMessages: 1 });
    await page.waitForChanges();

    // Assert
    const blipChatButton: HTMLAnchorElement = suporte.shadowRoot.querySelector('[slot=conteudo_painel_lateral] a[title=\'Suporte via chat\']');
    const badge = blipChatButton.querySelector('.badge');
    expect(badge.textContent).toBe('Novas mensagens');
  });

});
