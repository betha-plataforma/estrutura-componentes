import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { MSG_SEM_PERMISSAO_RECURSO } from '../../../../global/constants';
import { MenuHorizontalItem } from '../menu-horizontal-item';

describe('bth-menu-horizontal-item', () => {
  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({ components: [MenuHorizontalItem] });
  });

  it('renderiza light dom', async () => {
    // Arrange
    await page.setContent('<bth-menu-horizontal-item></bth-menu-horizontal-item>');

    // Assert
    expect(page.root).toEqualLightHtml('<bth-menu-horizontal-item></bth-menu-horizontal-item>');
  });

  it('renderiza corretamente com descricao', async () => {
    // Arrange
    await page.setContent('<bth-menu-horizontal-item></bth-menu-horizontal-item>');

    // Act
    let descricaoOpcaoMenu = 'Opcão';
    const menuHorizontalItem: HTMLBthMenuHorizontalItemElement = page.doc.querySelector('bth-menu-horizontal-item');
    menuHorizontalItem.setAttribute('descricao', descricaoOpcaoMenu);

    await page.waitForChanges();

    // Assert
    expect(menuHorizontalItem.descricao).toBe(descricaoOpcaoMenu);

    const descricao: HTMLSpanElement = menuHorizontalItem.shadowRoot.querySelector('span');
    expect(descricao.textContent).toBe(descricaoOpcaoMenu);
  });

  it('renderiza corretamente contador menor que 100', async () => {
    // Arrange
    await page.setContent('<bth-menu-horizontal-item></bth-menu-horizontal-item>');

    // Act
    let contador = 99;
    const menuHorizontalItem: HTMLBthMenuHorizontalItemElement = page.doc.querySelector('bth-menu-horizontal-item');
    menuHorizontalItem.setAttribute('contador', contador.toString());
    await page.waitForChanges();

    // Assert
    const badge: HTMLDivElement = menuHorizontalItem.shadowRoot.querySelector('.badge');
    expect(menuHorizontalItem.contador).toBe(contador);
    expect(badge.textContent).toBe(contador.toString());
  });

  it('renderiza corretamente contador maior igual 100', async () => {
    // Arrange
    await page.setContent('<bth-menu-horizontal-item></bth-menu-horizontal-item>');

    // Act
    let contador = 100;
    const menuHorizontalItem: HTMLBthMenuHorizontalItemElement = page.doc.querySelector('bth-menu-horizontal-item');
    menuHorizontalItem.setAttribute('contador', contador.toString());
    await page.waitForChanges();

    // Assert
    const badge: HTMLDivElement = menuHorizontalItem.shadowRoot.querySelector('.badge');
    expect(menuHorizontalItem.contador).toBe(contador);
    expect(badge.textContent).toBe('99+');
  });

  it('renderiza desabilitado quando nao possuir permissao', async () => {
    // Arrange
    await page.setContent('<bth-menu-horizontal-item></bth-menu-horizontal-item>');

    // Act
    let possuiPermissao = false;
    const menuHorizontalItem: HTMLBthMenuHorizontalItemElement = page.doc.querySelector('bth-menu-horizontal-item');
    menuHorizontalItem.setAttribute('possui-permissao', possuiPermissao.toString());
    await page.waitForChanges();

    // Assert
    expect(menuHorizontalItem.possuiPermissao).toBe(possuiPermissao);

    const link: HTMLAnchorElement = menuHorizontalItem.shadowRoot.querySelector('a');
    expect(link.classList.contains('menu-horizontal__item--disabled')).toBeTruthy();
    expect(link.title).toBe(MSG_SEM_PERMISSAO_RECURSO);
    expect(link.getAttribute('aria-disabled')).toBe('true');

    // tabindex = -1 indica que não elemento está focável
    expect(link.tabIndex).toBe(-1);
  });

  it('renderiza corretamente quando estiver ativo', async () => {
    // Arrange
    await page.setContent('<bth-menu-horizontal-item></bth-menu-horizontal-item>');

    // Act
    let isAtivo = true;
    const menuHorizontalItem: HTMLBthMenuHorizontalItemElement = page.doc.querySelector('bth-menu-horizontal-item');
    menuHorizontalItem.setAttribute('ativo', isAtivo.toString());
    await page.waitForChanges();

    // Assert
    expect(menuHorizontalItem.ativo).toBe(isAtivo);

    const menuBlock: HTMLDivElement = menuHorizontalItem.shadowRoot.querySelector('.menu-horizontal__item');
    expect(menuBlock.classList.contains('menu-horizontal__item--active')).toBeTruthy();
  });

  it('emite evento ao ser clicado', async () => {
    // Arrange
    await page.setContent('<bth-menu-horizontal-item></bth-menu-horizontal-item>');

    const menuHorizontalItem: HTMLBthMenuHorizontalItemElement = page.doc.querySelector('bth-menu-horizontal-item');
    const menuOpcaoId = 'menu_opcao_id_1';
    menuHorizontalItem.setAttribute('identificador', menuOpcaoId);

    let onMenuHorizontalSelecionado = jest.fn();
    menuHorizontalItem.addEventListener('menuHorizontalSelecionado', onMenuHorizontalSelecionado);

    // Act
    const link: HTMLAnchorElement = menuHorizontalItem.shadowRoot.querySelector('a');
    link.click();

    await page.waitForChanges();

    // Assert
    expect(onMenuHorizontalSelecionado).toHaveBeenCalled();
    expect(onMenuHorizontalSelecionado.mock.calls[0][0].detail).toStrictEqual({ identificador: menuOpcaoId });
  });

  it('nao emite evento quando clicado e não possui permissão', async () => {
    // Arrange
    await page.setContent('<bth-menu-horizontal-item></bth-menu-horizontal-item>');

    const menuHorizontalItem: HTMLBthMenuHorizontalItemElement = page.doc.querySelector('bth-menu-horizontal-item');
    const menuOpcaoId = 'menu_opcao_id_1';
    menuHorizontalItem.setAttribute('identificador', menuOpcaoId);
    menuHorizontalItem.setAttribute('possui-permissao', 'false');

    let onMenuHorizontalSelecionado = jest.fn();
    menuHorizontalItem.addEventListener('menuHorizontalSelecionado', onMenuHorizontalSelecionado);

    // Act
    const link: HTMLAnchorElement = menuHorizontalItem.shadowRoot.querySelector('a');
    link.click();

    await page.waitForChanges();

    // Assert
    expect(onMenuHorizontalSelecionado).not.toHaveBeenCalled();
  });

});
