import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { setGlobalOrWindowProperty } from '../../../../../test/utils/spec.helper';
import { MenuBannerAlteradoEvent } from '../../app.interfaces';
import { MenuPainelLateral } from '../menu-painel-lateral';
import { PainelLateralShowEvent } from '../menu-painel-lateral.interfaces';

describe('bth-menu-painel-lateral', () => {
  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({ components: [MenuPainelLateral] });
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renderiza light & shadow dom quando fechado', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral></bth-menu-painel-lateral>');

    // Assert
    expect(page.root).toEqualHtml(`
      <bth-menu-painel-lateral aria-expanded="false" aria-hidden="true" aria-label="Painel lateral">
        <mock:shadow-root>
          <div aria-expanded="false" aria-hidden="true" class="painel-lateral">
            <header>
              <button class="btn-back" title="Voltar">
                <bth-icone icone="arrow-left"></bth-icone>
              </button>
              <button class="btn-close" title="Fechar todos">
                <bth-icone icone="close"></bth-icone>
              </button>
            </header>
          </div>
        </mock:shadow-root>
      </bth-menu-painel-lateral>
    `);
  });

  it('renderiza light & shadow dom quando aberto', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral></bth-menu-painel-lateral>');

    // Act
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = page.doc.querySelector('bth-menu-painel-lateral');
    menuPainelLateral.show = true;
    await page.waitForChanges();

    // Assert
    expect(page.root).toEqualHtml(`
      <bth-menu-painel-lateral aria-expanded="true" aria-hidden="false" aria-label="Painel lateral" show="">
        <mock:shadow-root>
          <div aria-expanded="true" aria-hidden="false" class="painel-lateral painel-lateral--show">
            <header>
              <button class="btn-back" title="Voltar">
                <bth-icone icone="arrow-left"></bth-icone>
              </button>
              <button class="btn-close" title="Fechar todos">
                <bth-icone icone="close"></bth-icone>
              </button>
            </header>
            <slot>
              Conteúdo painel lateral
            </slot>
          </div>
        </mock:shadow-root>
      </bth-menu-painel-lateral>
    `);
  });

  it('inicializa com painel lateral fechado por padrão', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral></bth-menu-painel-lateral>');

    // Assert
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = page.doc.querySelector('bth-menu-painel-lateral');
    expect(menuPainelLateral.show).toBe(false);

    const painelLateral = menuPainelLateral.shadowRoot.querySelector('.painel-lateral');
    const possuiClasseShow = painelLateral.classList.contains('painel-lateral--show');
    expect(possuiClasseShow).toBe(false);
  });

  it('exibe o painel lateral ao alterar propriedade para show="true"', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral></bth-menu-painel-lateral>');

    // Act
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = page.doc.querySelector('bth-menu-painel-lateral');
    menuPainelLateral.show = true;
    await page.waitForChanges();

    // Assert
    const painelLateral = menuPainelLateral.shadowRoot.querySelector('.painel-lateral');
    const possuiClasseShow = painelLateral.classList.contains('painel-lateral--show');
    expect(possuiClasseShow).toBeTruthy();
  });

  it('esconde o painel lateral ao alterar propriedade para show="false"', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral show></bth-menu-painel-lateral>');

    // Act
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = page.doc.querySelector('bth-menu-painel-lateral');
    menuPainelLateral.show = false;
    await page.waitForChanges();

    // Assert
    const painelLateral = menuPainelLateral.shadowRoot.querySelector('.painel-lateral');
    const hasClassShow = painelLateral.classList.contains('painel-lateral--show');
    expect(hasClassShow).toBeFalsy();
  });

  it('esconde o painel lateral ao chamar método "fecharPaineisAbertos"', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral show></bth-menu-painel-lateral>');

    // Act

    const menuPainelLateral: HTMLBthMenuPainelLateralElement = page.doc.querySelector('bth-menu-painel-lateral');
    await menuPainelLateral.fecharPaineisAbertos();
    await page.waitForChanges();

    // Assert
    const painelLateral = menuPainelLateral.shadowRoot.querySelector('.painel-lateral');
    const hasClassShow = painelLateral.classList.contains('painel-lateral--show');
    expect(hasClassShow).toBeFalsy();
  });

  it('executa metodo que altera abertura do painel após delay', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral></bth-menu-painel-lateral>');

    // Act
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = page.doc.querySelector('bth-menu-painel-lateral');
    await menuPainelLateral.setShowComAnimacao(true);
    jest.runOnlyPendingTimers();

    // Assert
    expect(setTimeout).toBeCalled();
  });

  it('cancela abertura com delays agendada', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral></bth-menu-painel-lateral>');

    // Act
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = page.doc.querySelector('bth-menu-painel-lateral');
    await menuPainelLateral.setShowComAnimacao(true);
    await menuPainelLateral.cancelarAberturaComAnimacao();

    // Assert
    expect(clearTimeout).toBeCalled();
  });

  it('cancela abertura mesmo sem delays agendada', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral></bth-menu-painel-lateral>');

    // Act
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = page.doc.querySelector('bth-menu-painel-lateral');
    await menuPainelLateral.cancelarAberturaComAnimacao();

    // Assert
    expect(clearTimeout).toBeCalled();
  });

  it('fecha paineis abertos emitindo evento para fechar sobrepostos', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral></bth-menu-painel-lateral>');

    const menuPainelLateral: HTMLBthMenuPainelLateralElement = page.doc.querySelector('bth-menu-painel-lateral');

    let onPainelLateralShow = jest.fn((data) => {
      // Assert
      expect(data.detail.show).toBeFalsy();
      expect(data.detail.fecharSobrepostos).toBeTruthy();
    });
    menuPainelLateral.addEventListener('painelLateralShow', onPainelLateralShow);

    // Act
    await menuPainelLateral.fecharPaineisAbertos();

    // Assert
    expect(onPainelLateralShow).toBeCalledTimes(1);
  });

  it('emite eventos ao alterar propriedade show do elemento', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral></bth-menu-painel-lateral>');

    // Act
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = page.doc.querySelector('bth-menu-painel-lateral');
    let onPainelLateralShow = jest.fn();
    menuPainelLateral.addEventListener('painelLateralShow', onPainelLateralShow);

    // 1. Fechado > Aberto
    menuPainelLateral.show = true;

    // 2. Aberto > Fechado
    menuPainelLateral.show = false;

    // Assert
    expect(onPainelLateralShow).toBeCalledTimes(2);
  });

  it('fecha painel ao receber evento que outro painel foi aberto', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral show></bth-menu-painel-lateral>');

    // Act
    const detail = { origemId: 'mock', show: true };
    const event: CustomEvent<PainelLateralShowEvent> = new CustomEvent('painelLateralShow', { detail });
    window.dispatchEvent(event);
    await page.waitForChanges();

    // Assert
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = page.doc.querySelector('bth-menu-painel-lateral');
    expect(menuPainelLateral.show).toBeFalsy();
  });

  it('emite evento ao clicar no botão fechar todos', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral show></bth-menu-painel-lateral>');

    let onPainelLateralShow = jest.fn();
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = page.doc.querySelector('bth-menu-painel-lateral');
    menuPainelLateral.addEventListener('painelLateralShow', onPainelLateralShow);

    await page.waitForChanges();

    // Act
    const botaoFecharTodos: HTMLButtonElement = menuPainelLateral.shadowRoot.querySelector('.btn-close');
    botaoFecharTodos.click();
    await page.waitForChanges();

    // Assert
    expect(menuPainelLateral.show).toBeFalsy();
    expect(onPainelLateralShow).toBeCalled();
  });

  it('emite evento ao clicar no botão voltar', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral show></bth-menu-painel-lateral>');

    let onPainelLateralShow = jest.fn();
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = page.doc.querySelector('bth-menu-painel-lateral');
    menuPainelLateral.addEventListener('painelLateralShow', onPainelLateralShow);

    await page.waitForChanges();

    // Act
    const botaoFecharTodos: HTMLButtonElement = menuPainelLateral.shadowRoot.querySelector('.btn-back');
    botaoFecharTodos.click();
    await page.waitForChanges();

    // Assert
    expect(menuPainelLateral.show).toBeFalsy();
    expect(onPainelLateralShow).toBeCalled();
  });

  it('reage ao evento de resize do DOM', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral show></bth-menu-painel-lateral>');
    const onWindowResize = jest.spyOn(MenuPainelLateral.prototype, 'onWindowResize');

    // Act
    setGlobalOrWindowProperty(global, 'innerWidth', 200);
    page.win.dispatchEvent(new Event('resize'));
    await page.waitForChanges();

    // Assert
    expect(onWindowResize).toBeCalledTimes(1);
    onWindowResize.mockRestore();
  });

  it('reage ao evento de banner alterado', async () => {
    // Arrange
    await page.setContent('<bth-menu-painel-lateral show></bth-menu-painel-lateral>');
    const onBannerAlterado = jest.spyOn(MenuPainelLateral.prototype, 'onBannerAlterado');

    // Act
    const detail = { possui: true };
    const event: CustomEvent<MenuBannerAlteradoEvent> = new CustomEvent('bannerAlterado', { detail });
    window.dispatchEvent(event);
    await page.waitForChanges();

    // Assert
    expect(onBannerAlterado).toBeCalledTimes(1);
    onBannerAlterado.mockRestore();
  });

});
