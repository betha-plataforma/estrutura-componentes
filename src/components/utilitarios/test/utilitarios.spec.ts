import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { Utilitarios } from '../utilitarios';

describe('utilitarios', () => {
  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({ components: [Utilitarios] });
  });

  it('renderiza icone desktop', async () => {
    // Act
    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');

    // Assert
    expect(utilitarios).not.toBeNull();

    expect(utilitarios.shadowRoot.querySelector('bth-menu-ferramenta').getAttribute('descricao')).toEqual('Utilitários');
    expect(utilitarios.shadowRoot.querySelector('bth-menu-ferramenta').getAttribute('tituloPainelLateral')).toEqual('Utilitários');

    const menuFerramentaIcone: HTMLBthMenuFerramentaIconeElement = utilitarios.shadowRoot.querySelector('[slot=menu_item_desktop]');
    expect(menuFerramentaIcone).not.toBeNull();
    expect(menuFerramentaIcone.getAttribute('icone')).toBe('view-grid');
  });

  it('renderiza icone mobile', async () => {
    // Act
    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');

    // Assert
    expect(utilitarios).not.toBeNull();

    const menuFerramentaIcone: HTMLBthMenuFerramentaIconeElement = utilitarios.shadowRoot.querySelector('[slot=menu_item_mobile]');
    expect(menuFerramentaIcone).not.toBeNull();
    expect(menuFerramentaIcone.getAttribute('icone')).toBe('view-grid');
  });

  it('renderiza descrição mobile', async () => {
    // Act
    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');

    // Assert
    expect(utilitarios).not.toBeNull();

    const descricaoMobile: HTMLSpanElement = utilitarios.shadowRoot.querySelector('[slot=menu_descricao_mobile]');
    expect(descricaoMobile).not.toBeNull();
    expect(descricaoMobile.textContent).toBe('Utilitários');
  });

  it('renderiza conteúdo painel lateral com um card normal', async () => {
    // Arrange
    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitario = { nome: 'Lorem Ipsum', rota: '/lorem/ipsuim', icone: 'key', possuiPermissao: true, };

    // Act
    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');
    utilitarios.utilitarios = [utilitario];
    await page.waitForChanges();

    // Assert
    const utilitarioButton: HTMLButtonElement = utilitarios.shadowRoot.querySelector('[slot=conteudo_painel_lateral] button.bth__card');
    expect(utilitarioButton.classList.contains('bth__card--clickable')).toBeTruthy();
    expect(utilitarioButton.textContent).toBe(utilitario.nome);
    expect(utilitarioButton.getAttribute('disabled')).toBeNull();
    expect(utilitarioButton.getAttribute('aria-disabled')).toBe('false');
    expect(utilitarioButton.getAttribute('aria-label')).toBe(`Acessar o utilitário ${utilitario.nome}`);

    const iconeUtilitario: HTMLBthIconeElement = utilitarioButton.querySelector('bth-icone');
    expect(iconeUtilitario.getAttribute('icone')).toBe(utilitario.icone);
  });

  it('renderiza conteúdo painel lateral com um card sem permissão', async () => {
    // Arrange
    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitario = { nome: 'Lorem Ipsum', rota: '/lorem/ipsuim', icone: 'key', possuiPermissao: false, };

    // Act
    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');
    utilitarios.utilitarios = [utilitario];
    await page.waitForChanges();

    // Assert
    const utilitarioButton: HTMLButtonElement = utilitarios.shadowRoot.querySelector('[slot=conteudo_painel_lateral] button.bth__card');
    expect(utilitarioButton.classList.contains('bth__card--disabled')).toBeTruthy();
    expect(utilitarioButton.textContent).toBe(utilitario.nome);
    expect(utilitarioButton.getAttribute('disabled')).toBeDefined();
    expect(utilitarioButton.getAttribute('aria-disabled')).toBe('true');
    expect(utilitarioButton.getAttribute('aria-label')).toBe(`Acessar o utilitário ${utilitario.nome}`);

    const iconeUtilitario: HTMLBthIconeElement = utilitarioButton.querySelector('bth-icone');
    expect(iconeUtilitario.getAttribute('icone')).toBe(utilitario.icone);
  });

  it('emite evento de utilitario selecionado ao clicar no utiltário', async () => {
    // Arrange
    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitario = { nome: 'Lorem Ipsum', rota: '/lorem/ipsuim', icone: 'key', possuiPermissao: true, };

    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');
    utilitarios.utilitarios = [utilitario];
    await page.waitForChanges();

    let onOpcaoUtilitarioSelecionada = jest.fn();
    utilitarios.addEventListener('opcaoUtilitarioSelecionada', onOpcaoUtilitarioSelecionada);

    // Act
    const utilitarioButton: HTMLButtonElement = utilitarios.shadowRoot.querySelector('[slot=conteudo_painel_lateral] button.bth__card');
    utilitarioButton.click();
    await page.waitForChanges();

    // Assert
    expect(onOpcaoUtilitarioSelecionada).toHaveBeenCalled();
    expect(onOpcaoUtilitarioSelecionada.mock.calls[0][0].detail).toStrictEqual({
      nome: utilitario.nome,
      icone: utilitario.icone,
      rota: utilitario.rota
    });
  });

  it('não emite evento de utilitario selecionado ao clicar em utiltário que não possui permissão', async () => {
    // Arrange
    await page.setContent('<bth-utilitarios></bth-utilitarios>');
    const utilitario = { nome: 'Lorem Ipsum', rota: '/lorem/ipsuim', icone: 'key', possuiPermissao: false, };

    const utilitarios: HTMLBthUtilitariosElement = page.doc.querySelector('bth-utilitarios');
    utilitarios.utilitarios = [utilitario];
    await page.waitForChanges();

    let onOpcaoUtilitarioSelecionada = jest.fn();
    utilitarios.addEventListener('opcaoUtilitarioSelecionada', onOpcaoUtilitarioSelecionada);

    // Act
    const utilitarioButton: HTMLButtonElement = utilitarios.shadowRoot.querySelector('[slot=conteudo_painel_lateral] button.bth__card');
    utilitarioButton.click();
    await page.waitForChanges();

    // Assert
    expect(onOpcaoUtilitarioSelecionada).not.toHaveBeenCalled();
  });

});
