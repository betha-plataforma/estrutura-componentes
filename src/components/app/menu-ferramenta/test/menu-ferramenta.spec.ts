import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { setupMatchingMediaQuery, setGlobalOrWindowProperty } from '../../../../../test/utils/spec.helper';
import { MenuPainelLateral } from '../../menu-painel-lateral/menu-painel-lateral';
import { MenuFerramenta } from '../menu-ferramenta';
import { SLOT } from '../menu-ferramenta.constants';


jest.useFakeTimers();

describe('bth-menu-ferramenta', () => {
  let page: SpecPage;

  beforeEach(async () => {
    setupMatchingMediaQuery(true);

    page = await newSpecPage({ components: [MenuFerramenta, MenuPainelLateral] });
  });

  it('renderiza light-dom', async () => {
    // Arrange
    await page.setContent('<bth-menu-ferramenta></bth-menu-ferramenta>');

    // Assert
    expect(page.root).not.toBeNull();
    expect(page.root).toEqualLightHtml('<bth-menu-ferramenta></bth-menu-ferramenta>');
  });

  it('renderiza com contéudo de painel implementado', async () => {
    // Arrange
    let conteudoPainelLateral = 'Este painel é para cenário de testes';

    // Act
    await page.setContent(`
      <bth-menu-ferramenta>
        <span slot="${SLOT.CONTEUDO_PAINEL_LATERAL}">${conteudoPainelLateral}</span>
      </bth-menu-ferramenta>
    `);

    // Assert

    // Verifica se o slot implementado está no Light DOM
    const menuFerramenta: HTMLBthMenuFerramentaElement = page.doc.querySelector('bth-menu-ferramenta');
    expect(menuFerramenta.innerHTML).toMatch(new RegExp(conteudoPainelLateral, 'ig'));

    // Verifica se o componente de painel lateral está declarado
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = menuFerramenta.shadowRoot.querySelector('bth-menu-painel-lateral');
    expect(menuPainelLateral).not.toBeNull();
    const slotConteudoPainelLateral: HTMLSlotElement = menuPainelLateral.querySelector('slot[name="conteudo_painel_lateral"]');
    expect(slotConteudoPainelLateral).not.toBeNull();
  });

  it('renderiza com painel lateral que exibe o titulo', async () => {
    // Arrange
    let descricaoPainelLateral = 'Painel de Testes';
    let tituloPainelLateral = 'Titulo do Painel de Testes';
    let conteudoPainelLateral = 'Este painel é para cenário de testes';

    // Act
    await page.setContent(`
      <bth-menu-ferramenta descricao="${descricaoPainelLateral}" titulo-painel-lateral="${tituloPainelLateral}">
        <span slot="${SLOT.CONTEUDO_PAINEL_LATERAL}">${conteudoPainelLateral}</span>
      </bth-menu-ferramenta>
    `);

    // Assert
    const menuFerramenta: HTMLBthMenuFerramentaElement = page.doc.querySelector('bth-menu-ferramenta');
    expect(menuFerramenta.descricao).toBe(descricaoPainelLateral);
    expect(menuFerramenta.tituloPainelLateral).toBe(tituloPainelLateral);

    // Verifica se o componente de painel lateral recebeu o título
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = menuFerramenta.shadowRoot.querySelector('bth-menu-painel-lateral');
    expect(menuPainelLateral.titulo).toBe(menuPainelLateral.titulo);
  });

  it('renderiza o slot de menu para desktops', async () => {
    // Arrange
    let menuItemDesktopText = 'menu item desktop text';

    // Act
    await page.setContent(`
      <bth-menu-ferramenta>
        <i slot="${SLOT.MENU_ITEM_DESKTOP}">${menuItemDesktopText}</i>
        <span slot="${SLOT.CONTEUDO_PAINEL_LATERAL}">Conteudo qualquer</span>
      </bth-menu-ferramenta>
    `);

    // Assert
    const menuFerramenta: HTMLBthMenuFerramentaElement = page.doc.querySelector('bth-menu-ferramenta');

    // Verifica que existe o slot no shadowRoot e posteriormente sua implementação no Light Dom
    const menuItemDesktop: HTMLSlotElement = menuFerramenta.shadowRoot.querySelector(`slot[name="${SLOT.MENU_ITEM_DESKTOP}"]`);
    expect(menuItemDesktop).not.toBeNull();
    const menuItemDesktopImpl: HTMLSlotElement = menuFerramenta.querySelector(`[slot="${SLOT.MENU_ITEM_DESKTOP}"]`);
    expect(menuItemDesktopImpl).not.toBeNull();
    expect(menuItemDesktopImpl.textContent).toBe(menuItemDesktopText);
  });

  it('renderiza os slots de menu para mobile', async () => {
    // Arrange
    setupMatchingMediaQuery(false);

    // Act
    let menuItemMobileText = 'menu item mobile text';
    let menuItemMobileDescricao = 'menu item desktop text';
    await page.setContent(`
      <bth-menu-ferramenta>
        <i slot="${SLOT.MENU_ITEM_MOBILE}">${menuItemMobileText}</i>
        <span slot="${SLOT.MENU_DESCRICAO_MOBILE}">${menuItemMobileDescricao}</span>
        <span slot="${SLOT.CONTEUDO_PAINEL_LATERAL}">Conteudo qualquer</span>
      </bth-menu-ferramenta>
    `);

    // Assert
    const menuFerramenta: HTMLBthMenuFerramentaElement = page.doc.querySelector('bth-menu-ferramenta');

    // Verifica que existe o slot no shadowRoot e posteriormente sua implementação no Light Dom
    const menuItemMobile: HTMLSlotElement = menuFerramenta.shadowRoot.querySelector(`slot[name="${SLOT.MENU_ITEM_MOBILE}"]`);
    expect(menuItemMobile).not.toBeNull();
    const menuItemMobileImpl = menuFerramenta.querySelector(`[slot="${SLOT.MENU_ITEM_MOBILE}"]`);
    expect(menuItemMobileImpl).not.toBeNull();
    expect(menuItemMobileImpl.textContent).toBe(menuItemMobileText);

    const menuDescricaoMobile: HTMLSlotElement = menuFerramenta.shadowRoot.querySelector(`slot[name="${SLOT.MENU_DESCRICAO_MOBILE}"]`);
    expect(menuDescricaoMobile).not.toBeNull();
    const menuDescricaoMobileImpl = menuFerramenta.querySelector(`[slot="${SLOT.MENU_DESCRICAO_MOBILE}"]`);
    expect(menuDescricaoMobileImpl).not.toBeNull();
    expect(menuDescricaoMobileImpl.textContent).toBe(menuItemMobileDescricao);
  });

  it('deve marcar ferramenta como ativa ao receber evento do painel aberto', async () => {
    // Arrange
    await page.setContent(`
      <bth-menu-ferramenta descricao="Hello World" titulo-painel-lateral="Lorem Ipsum">
        <i class="mdi mdi-cloud" slot="menu_item_desktop">Ícone Desktop</i>
        <section slot="conteudo_painel_lateral">Conteúdo</section>
      </bth-menu-ferramenta>
    `);

    // Act
    const menuFerramenta: HTMLBthMenuFerramentaElement = page.doc.querySelector('bth-menu-ferramenta');
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = menuFerramenta.shadowRoot.querySelector('bth-menu-painel-lateral');
    menuPainelLateral.show = true;
    await page.waitForChanges();

    // Assert
    const desktopToggler: HTMLDivElement = menuFerramenta.shadowRoot.querySelector('.ferramenta-menu__desktop-toggler');
    expect(desktopToggler.classList.contains('ferramenta-menu__desktop-toggler--active')).toBeTruthy();
  });

  it('deve desmarcar ferramenta como ativa ao receber "painelLateralShow"', async () => {
    // Arrange
    await page.setContent(`
      <bth-menu-ferramenta descricao="Hello World" titulo-painel-lateral="Lorem Ipsum" true>
        <i class="mdi mdi-cloud" slot="menu_item_desktop">Ícone Desktop</i>
        <i class="mdi mdi-cloud" slot="menu_item_mobile">Ícone Desktop</i>
        <section slot="conteudo_painel_lateral">Conteúdo</section>
      </bth-menu-ferramenta>
    `);

    // Act
    const menuFerramenta: HTMLBthMenuFerramentaElement = page.doc.querySelector('bth-menu-ferramenta');
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = menuFerramenta.shadowRoot.querySelector('bth-menu-painel-lateral');
    menuPainelLateral.show = false;
    await page.waitForChanges();

    // Assert
    const desktopToggler: HTMLDivElement = menuFerramenta.shadowRoot.querySelector('.ferramenta-menu__desktop-toggler');
    expect(desktopToggler.classList.contains('ferramenta-menu__desktop-toggler--active')).toBeFalsy();
  });

  it('reage ao evento de resize do DOM', async () => {
    // Arrange
    await page.setContent('<bth-menu-ferramenta></bth-menu-ferramenta>');
    const onWindowResize = jest.spyOn(MenuFerramenta.prototype, 'onWindowResize');

    // Act
    setGlobalOrWindowProperty(global, 'innerWidth', 200);
    page.win.dispatchEvent(new Event('resize'));
    await page.waitForChanges();

    // Assert
    expect(onWindowResize).toBeCalledTimes(1);
    onWindowResize.mockRestore();
  });

  it('deve alterar estado do painel lateral ao clicar no icone desktop', async () => {
    // Arrange
    await page.setContent(`
      <bth-menu-ferramenta>
        <i slot="${SLOT.MENU_ITEM_DESKTOP}">Ícone</i>
        <span slot="${SLOT.CONTEUDO_PAINEL_LATERAL}">Conteudo qualquer</span>
      </bth-menu-ferramenta>
    `);

    // Act
    const menuFerramenta: HTMLBthMenuFerramentaElement = page.doc.querySelector('bth-menu-ferramenta');
    const menuItemDesktopLink = menuFerramenta.shadowRoot.querySelector('a');
    menuItemDesktopLink.click();
    await page.waitForChanges();

    // Assert
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = menuFerramenta.shadowRoot.querySelector('bth-menu-painel-lateral');
    expect(menuPainelLateral.show).toBe(true);
  });

  it('deve alterar estado do painel lateral ao clicar no icone mobile', async () => {
    // Arrange
    setupMatchingMediaQuery(false);

    await page.setContent(`
      <bth-menu-ferramenta>
        <i slot="${SLOT.MENU_ITEM_MOBILE}">Ícone</i>
        <span slot="${SLOT.MENU_DESCRICAO_MOBILE}">Descrição</span>
        <span slot="${SLOT.CONTEUDO_PAINEL_LATERAL}">Conteudo qualquer</span>
      </bth-menu-ferramenta>
    `);

    // Act
    const menuFerramenta: HTMLBthMenuFerramentaElement = page.doc.querySelector('bth-menu-ferramenta');
    const menuItemDesktopLink = menuFerramenta.shadowRoot.querySelector('a');
    menuItemDesktopLink.click();
    await page.waitForChanges();

    // Assert
    const menuPainelLateral: HTMLBthMenuPainelLateralElement = menuFerramenta.shadowRoot.querySelector('bth-menu-painel-lateral');
    expect(menuPainelLateral.show).toBe(true);
  });

  it('delega metodo para fechar paineis ao componente painel lateral ', async () => {
    // Arrange
    const fecharPaineisAbertos = jest.spyOn(MenuPainelLateral.prototype, 'fecharPaineisAbertos');

    await page.setContent(`
      <bth-menu-ferramenta>
        <span slot="${SLOT.CONTEUDO_PAINEL_LATERAL}">Conteudo qualquer</span>
      </bth-menu-ferramenta>
    `);

    // Act
    const menuFerramenta: HTMLBthMenuFerramentaElement = page.doc.querySelector('bth-menu-ferramenta');
    await menuFerramenta.fecharPaineisAbertos();
    await page.waitForChanges();

    // Assert
    expect(fecharPaineisAbertos).toBeCalled();

    fecharPaineisAbertos.mockRestore();
  });

  it('nao delega metodo para fechar paineis ao componente painel lateral quando slot não estiver implementado', async () => {
    // Arrange
    const fecharPaineisAbertos = jest.spyOn(MenuPainelLateral.prototype, 'fecharPaineisAbertos');

    await page.setContent('<bth-menu-ferramenta></bth-menu-ferramenta>');

    // Act
    const menuFerramenta: HTMLBthMenuFerramentaElement = page.doc.querySelector('bth-menu-ferramenta');
    await menuFerramenta.fecharPaineisAbertos();
    await page.waitForChanges();

    // Assert
    expect(fecharPaineisAbertos).not.toBeCalled();

    fecharPaineisAbertos.mockRestore();
  });

});
