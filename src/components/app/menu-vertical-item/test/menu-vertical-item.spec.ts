import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { MSG_SEM_PERMISSAO_RECURSO } from '../../../../global/constants';
import { OpcaoMenuInterna } from '../../app.interfaces';
import { MenuVerticalItem } from '../menu-vertical-item';

describe('bth-menu-vertical-item', () => {
  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({ components: [MenuVerticalItem] });
  });

  it('renderiza lightdom', async () => {
    // Arrange
    await page.setContent('<bth-menu-vertical-item></bth-menu-vertical-item>');

    // Assert
    expect(page.root).toEqualLightHtml('<bth-menu-vertical-item></bth-menu-vertical-item>');
  });

  it('renderiza simples', async () => {
    // Arrange
    await page.setContent('<bth-menu-vertical-item></bth-menu-vertical-item>');

    // Act
    const opcaoMenu: OpcaoMenuInterna = { id: 'opcao1', descricao: 'Opção 1', icone: 'cloud' };
    const menuVerticalItem: HTMLBthMenuVerticalItemElement = page.doc.querySelector('bth-menu-vertical-item');
    menuVerticalItem.setAttribute('descricao', opcaoMenu.descricao);
    menuVerticalItem.setAttribute('icone', opcaoMenu.icone);
    await page.waitForChanges();

    // Assert
    expect(menuVerticalItem.descricao).toBe(opcaoMenu.descricao);
    const descricao: HTMLSpanElement = menuVerticalItem.shadowRoot.querySelector('span');
    expect(descricao.textContent).toBe(opcaoMenu.descricao);

    expect(menuVerticalItem.icone).toBe(opcaoMenu.icone);
    const icone: HTMLBthIconeElement = menuVerticalItem.shadowRoot.querySelector('bth-icone');
    expect(icone.getAttribute('icone')).toBe(opcaoMenu.icone);

    const link: HTMLAnchorElement = menuVerticalItem.shadowRoot.querySelector('a');
    expect(link.getAttribute('aria-haspopup')).toBe('false');
    expect(link.getAttribute('aria-expanded')).toBe('false');
    expect(link.getAttribute('aria-disabled')).toBe('false');
    expect(link.getAttribute('aria-label')).toBe(`Navegar para ${opcaoMenu.descricao}`);
  });

  it('renderiza simples ativo', async () => {
    // Arrange
    await page.setContent('<bth-menu-vertical-item></bth-menu-vertical-item>');

    // Act
    const menuVerticalItem: HTMLBthMenuVerticalItemElement = page.doc.querySelector('bth-menu-vertical-item');
    menuVerticalItem.setAttribute('ativo', 'true');
    await page.waitForChanges();

    // Assert
    expect(menuVerticalItem.ativo).toBe(true);
    const menuBlock: HTMLDivElement = menuVerticalItem.shadowRoot.querySelector('.menu-vertical__item');
    expect(menuBlock.classList.contains('menu-vertical__item--active')).toBeTruthy();
  });

  it('renderiza simples sem permissão', async () => {
    // Arrange
    await page.setContent('<bth-menu-vertical-item></bth-menu-vertical-item>');

    // Act
    const menuVerticalItem: HTMLBthMenuVerticalItemElement = page.doc.querySelector('bth-menu-vertical-item');
    menuVerticalItem.setAttribute('possui-permissao', 'false');
    await page.waitForChanges();

    // Assert
    expect(menuVerticalItem.possuiPermissao).toBe(false);

    const link: HTMLAnchorElement = menuVerticalItem.shadowRoot.querySelector('a');
    expect(link.classList.contains('menu-vertical__item--disabled')).toBeTruthy();
    expect(link.title).toBe(MSG_SEM_PERMISSAO_RECURSO);
    expect(link.getAttribute('aria-disabled')).toBe('true');

    // tabindex = -1 indica que não elemento está focável
    expect(link.tabIndex).toBe(-1);
  });

  it('renderiza simples recolhido', async () => {
    // Arrange
    await page.setContent('<bth-menu-vertical-item></bth-menu-vertical-item>');

    // Act
    const menuVerticalItem: HTMLBthMenuVerticalItemElement = page.doc.querySelector('bth-menu-vertical-item');
    menuVerticalItem.setAttribute('recolhido', 'true');

    await page.waitForChanges();

    // Assert
    expect(menuVerticalItem.recolhido).toBe(true);
    const menuBlock: HTMLDivElement = menuVerticalItem.shadowRoot.querySelector('.menu-vertical__item');
    expect(menuBlock.classList.contains('menu-vertical__item--collapsed')).toBeTruthy();
  });

  it('renderiza simples com contador menor que 100', async () => {
    // Arrange
    await page.setContent('<bth-menu-vertical-item></bth-menu-vertical-item>');

    // Act
    const menuVerticalItem: HTMLBthMenuVerticalItemElement = page.doc.querySelector('bth-menu-vertical-item');
    let valorContador = 37;
    menuVerticalItem.setAttribute('contador', valorContador.toString());

    await page.waitForChanges();

    const badge: HTMLDivElement = menuVerticalItem.shadowRoot.querySelector('.badge');
    expect(menuVerticalItem.contador).toBe(valorContador);
    expect(badge.textContent).toBe(valorContador.toString());
  });

  it('renderiza simples com contador maior ighual a 100', async () => {
    // Arrange
    await page.setContent('<bth-menu-vertical-item></bth-menu-vertical-item>');

    // Act
    const menuVerticalItem: HTMLBthMenuVerticalItemElement = page.doc.querySelector('bth-menu-vertical-item');
    let valorContador = 100;
    menuVerticalItem.setAttribute('contador', valorContador.toString());

    await page.waitForChanges();

    const badge: HTMLDivElement = menuVerticalItem.shadowRoot.querySelector('.badge');
    expect(menuVerticalItem.contador).toBe(valorContador);
    expect(badge.textContent).toBe('99+');
  });

  it('renderiza com submenus', async () => {
    // Arrange
    await page.setContent('<bth-menu-vertical-item></bth-menu-vertical-item>');

    // Act
    const menuVerticalItem: HTMLBthMenuVerticalItemElement = page.doc.querySelector('bth-menu-vertical-item');
    const opcaoSubmenu = { id: 1, descricao: 'Opção Submenu', possuiPermissao: true };
    menuVerticalItem.submenus = [opcaoSubmenu];

    await page.waitForChanges();

    // Assert
    const menuBlock: HTMLDivElement = menuVerticalItem.shadowRoot.querySelector('.menu-vertical__item');
    expect(menuBlock.classList.contains('menu-vertical__item--has-children')).toBeTruthy();

    const menuLink: HTMLAnchorElement = menuVerticalItem.shadowRoot.querySelector('a');
    expect(menuLink.getAttribute('aria-haspopup')).toBe('true');
    expect(menuLink.getAttribute('aria-expanded')).toBe('true');
    expect(menuLink.getAttribute('aria-label')).toBe(`Expandir ${menuVerticalItem.descricao}`);

    const icone: HTMLBthIconeElement = menuVerticalItem.shadowRoot.querySelector('bth-icone[icone="chevron-up"]');
    expect(icone).not.toBeNull();
    expect(icone.getAttribute('icone')).toBe('chevron-up');

    const menuVerticalItemSubMenu: HTMLBthMenuVerticalItemElement = menuVerticalItem.shadowRoot.querySelector('bth-menu-vertical-item');
    expect(menuVerticalItemSubMenu).not.toBeNull();
    expect(menuVerticalItemSubMenu.descricao).toBe(opcaoSubmenu.descricao);
  });

  it('emite evento de menu selecionado ao clicar no link', async () => {
    // Arrange
    await page.setContent('<bth-menu-vertical-item></bth-menu-vertical-item>');

    const menuOpcaoId = 'menu_opcao_id_1';
    const menuVerticalItem: HTMLBthMenuVerticalItemElement = page.doc.querySelector('bth-menu-vertical-item');
    menuVerticalItem.setAttribute('identificador', menuOpcaoId);

    let onMenuVerticalSelecionado = jest.fn();
    menuVerticalItem.addEventListener('menuVerticalSelecionado', onMenuVerticalSelecionado);

    await page.waitForChanges();

    // Act
    const link: HTMLAnchorElement = menuVerticalItem.shadowRoot.querySelector('a');
    link.click();

    await page.waitForChanges();

    // Assert
    expect(onMenuVerticalSelecionado).toHaveBeenCalled();
    expect(onMenuVerticalSelecionado.mock.calls[0][0].detail).toStrictEqual({
      identificador: menuOpcaoId,
      identificadorPai: undefined
    });
  });

  it('não emite evento de menu selecionado ao clicar no link e não possuir permissão', async () => {
    // Arrange
    await page.setContent('<bth-menu-vertical-item></bth-menu-vertical-item>');

    const menuOpcaoId = 'menu_opcao_id_1';
    const menuVerticalItem: HTMLBthMenuVerticalItemElement = page.doc.querySelector('bth-menu-vertical-item');
    menuVerticalItem.setAttribute('identificador', menuOpcaoId);
    menuVerticalItem.setAttribute('possui-permissao', 'false');

    let onMenuVerticalSelecionado = jest.fn();
    menuVerticalItem.addEventListener('menuVerticalSelecionado', onMenuVerticalSelecionado);

    await page.waitForChanges();

    // Act
    const link: HTMLAnchorElement = menuVerticalItem.shadowRoot.querySelector('a');
    link.click();

    await page.waitForChanges();

    // Assert
    expect(onMenuVerticalSelecionado).not.toHaveBeenCalled();
  });

});
