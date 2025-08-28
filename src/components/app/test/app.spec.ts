import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { setupMatchingMediaQuery, setGlobalOrWindowProperty } from '../../../../test/utils/spec.helper';
import { MSG_SEM_PERMISSAO_RECURSO } from '../../../global/constants';
import { App } from '../app';
import { SLOT } from '../app.constants';
import { ConteudoSinalizadoEvent } from '../app.interfaces';
import { MenuHorizontalSelecionadoEvent } from '../menu-horizontal-item/menu-horizontal-item.interfaces';
import { PainelLateralShowEvent } from '../menu-painel-lateral/menu-painel-lateral.interfaces';
import { MenuVerticalItem } from '../menu-vertical-item/menu-vertical-item';
import { MenuVerticalSelecionadoEvent } from '../menu-vertical-item/menu-vertical-item.interfaces';

describe('app', () => {
  let page: SpecPage;

  beforeEach(async () => {
    setupMatchingMediaQuery(true);

    page = await newSpecPage({ components: [App] });
  });

  it('renderiza light dom', async () => {
    // Arrange
    await page.setContent('<bth-app></bth-app>');

    // Assert
    expect(page.root).toEqualLightHtml('<bth-app></bth-app>');
  });

  it('renderiza conteudo slot "menu_marca_produto"', async () => {
    // Arrange
    const innerText = 'Cenário Teste';

    // Act
    await page.setContent(`
      <bth-app>
        <section slot="${SLOT.MARCA_PRODUTO}">${innerText}</section>
      </bth-app>
    `);

    // Assert
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    // Verifica implementação no lightdom
    const section: HTMLElement = app.querySelector('section');
    expect(section).not.toBeNull();
    expect(section.textContent).toBe(innerText);

    // Verifica existência no shadowdom
    const slot = app.shadowRoot.querySelector(`slot[name="${SLOT.MARCA_PRODUTO}"]`);
    expect(slot).not.toBeNull();
  });

  it('renderiza conteudo slot "menu_ferramentas"', async () => {
    // Arrange
    const innerText = 'Cenário Teste';

    // Act
    await page.setContent(`
      <bth-app>
        <section slot="${SLOT.FERRAMENTAS}">${innerText}</section>
      </bth-app>
    `);

    // Assert
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    // Verifica implementação no lightdom
    const section: HTMLElement = app.querySelector('section');
    expect(section).not.toBeNull();
    expect(section.textContent).toBe(innerText);

    // Verifica existência no shadowdom
    const slot = app.shadowRoot.querySelector(`slot[name="${SLOT.FERRAMENTAS}"]`);
    expect(slot).not.toBeNull();
  });

  it('renderiza conteudo slot "container_contexto" p/ desktops', async () => {
    // Arrange
    const innerText = 'Cenário Teste';

    // Act
    await page.setContent(`
     <bth-app>
       <section slot="${SLOT.CONTEXTO}">${innerText}</section>
     </bth-app>
   `);

    // Assert
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    // Verifica implementação no lightdom
    const section: HTMLElement = app.querySelector('section');
    expect(section).not.toBeNull();
    expect(section.textContent).toBe(innerText);

    // Verifica existência no shadowdom
    const slot = app.shadowRoot.querySelector(`slot[name="${SLOT.CONTEXTO}"]`);
    expect(slot).not.toBeNull();
  });

  it('não renderiza conteudo slot "container_contexto" p/ mobile', async () => {
    // Arrange
    setupMatchingMediaQuery(false);
    const innerText = 'Cenário Teste';

    // Act
    await page.setContent(`
     <bth-app>
       <section slot="${SLOT.CONTEXTO}">${innerText}</section>
     </bth-app>
   `);

    // Assert
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    const slot = app.shadowRoot.querySelector(`slot[name="${SLOT.CONTEXTO}"]`);
    expect(slot).toBeNull();
  });

  it('renderiza conteudo slot "container_aplicacao"', async () => {
    // Arrange
    const innerText = 'Cenário Teste';

    // Act
    await page.setContent(`
     <bth-app>
       <section slot="${SLOT.APLICACAO}">${innerText}</section>
     </bth-app>
   `);

    // Assert
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    // Verifica implementação no lightdom
    const section: HTMLElement = app.querySelector('section');
    expect(section).not.toBeNull();
    expect(section.textContent).toBe(innerText);

    // Verifica existência no shadowdom
    const slot = app.shadowRoot.querySelector(`slot[name="${SLOT.APLICACAO}"]`);
    expect(slot).not.toBeNull();
  });

  it('renderiza opções de navegação horizontal', async () => {
    // Arrange
    await page.setContent('<bth-app></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');
    app.opcoes = [
      { id: 1, descricao: 'Opção 1' }
    ];

    await page.waitForChanges();

    // Assert
    const menuHorizontalItem = app.shadowRoot.querySelector('bth-menu-horizontal-item');
    expect(menuHorizontalItem).not.toBeNull();
    expect(menuHorizontalItem.getAttribute('identificador')).toBe(app.opcoes[0].id.toString());
    expect(menuHorizontalItem.getAttribute('descricao')).toBe(app.opcoes[0].descricao);
  });

  it('renderiza opções de navegação vertical', async () => {
    // Arrange
    await page.setContent('<bth-app menu-vertical></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');
    app.opcoes = [
      { id: 1, descricao: 'Opção 1' }
    ];

    await page.waitForChanges();

    // Assert
    const menuVerticalItem = app.shadowRoot.querySelector('bth-menu-vertical-item');
    expect(menuVerticalItem).not.toBeNull();
    expect(menuVerticalItem.getAttribute('identificador')).toBe(app.opcoes[0].id.toString());
    expect(menuVerticalItem.getAttribute('descricao')).toBe(app.opcoes[0].descricao);
  });

  it('renderiza opções de navegação no header quando menu for vertical', async () => {
    // Arrange
    await page.setContent('<bth-app menu-vertical></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');
    app.opcoes = [{ id: 1, descricao: 'Opção 1' }];
    app.opcoesHeader = [{ id: 'relatorios', descricao: 'Relatórios', isAtivo: true }];
    await page.waitForChanges();

    // Assert
    const navHeader: HTMLElement = app.shadowRoot.querySelector('#menu_header');
    expect(navHeader).not.toBeNull();

    const menuHeaderItem = navHeader.querySelector('bth-menu-horizontal-item');
    expect(menuHeaderItem).not.toBeNull();
    expect(menuHeaderItem.getAttribute('identificador')).toBe(app.opcoesHeader[0].id.toString());
    expect(menuHeaderItem.getAttribute('descricao')).toBe(app.opcoesHeader[0].descricao);
    expect(menuHeaderItem.getAttribute('ativo')).not.toBeNull();
  });

  it('não renderiza opções de navegação no header quando menu for horizontal', async () => {
    // Arrange
    await page.setContent('<bth-app></bth-app>'); // Sem 'menu-vertical'

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');
    app.opcoesHeader = [{ id: 'relatorios', descricao: 'Relatórios' }];
    await page.waitForChanges();

    // Assert
    const navHeader: HTMLElement = app.shadowRoot.querySelector('#menu_header');
    expect(navHeader).toBeNull();
  });

  it('renderiza banner', async () => {
    // Arrange
    await page.setContent('<bth-app menu-vertical></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');
    app.banner = { texto: 'Lorem Ipsum', link: 'https://google.com/', tipo: 'warning' };
    await page.waitForChanges();

    // Assert
    const headerBanner: HTMLElement = app.shadowRoot.querySelector('.banner');
    expect(headerBanner).not.toBeNull();
    expect(headerBanner.classList.contains('banner--show')).toBeTruthy();

    const iconeBanner: HTMLBthIconeElement = headerBanner.querySelector('bth-icone');
    expect(iconeBanner.getAttribute('icone')).toBe('alert');

    const blocoTexto: HTMLElement = headerBanner.querySelector('.banner__content span');
    expect(blocoTexto.textContent).toBe(app.banner.texto);

    const maisInformacoesLink: HTMLAnchorElement = headerBanner.querySelector('.banner__content a');
    expect(maisInformacoesLink.href).toBe(app.banner.link);
  });


  it('reage ao evento de resize do DOM', async () => {
    // Arrange
    await page.setContent('<bth-app></bth-app>');
    const onWindowResize = jest.spyOn(App.prototype, 'onWindowResize');

    // Act
    setGlobalOrWindowProperty(global, 'innerWidth', 200);
    page.win.dispatchEvent(new Event('resize'));
    await page.waitForChanges();

    // Assert
    expect(onWindowResize).toBeCalledTimes(1);
    onWindowResize.mockRestore();
  });

  it('reage ao evento de abertura do painel lateral', async () => {
    // Arrange
    await page.setContent('<bth-app></bth-app>');
    const onPainelLateralShow = jest.spyOn(App.prototype, 'onPainelLateralShow');

    // Act
    const detail = { origemId: 'mock', show: true };
    const event: CustomEvent<PainelLateralShowEvent> = new CustomEvent('painelLateralShow', { detail });

    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');
    app.dispatchEvent(event);

    await page.waitForChanges();

    // Assert
    expect(onPainelLateralShow).toBeCalledTimes(1);
    onPainelLateralShow.mockRestore();
  });

  it('permite customizar cor da barra através do "menuBgColor"', async () => {
    // Arrange
    await page.setContent('<bth-app></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');
    app.menuBgColor = '#FFF';
    await page.waitForChanges();

    // Assert
    expect(app.style.getPropertyValue('--bth-app-menu-bg-color')).toBe(app.menuBgColor);
  });

  it('recebe eventos de conteudo sinalizado no desktop', async () => {
    // Arrange
    await page.setContent('<bth-app></bth-app>');

    const onConteudoSinalizado = jest.spyOn(App.prototype, 'onConteudoSinalizado');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');
    const detail = { possui: true, origem: 'nowhere' };
    const event: CustomEvent<ConteudoSinalizadoEvent> = new CustomEvent('conteudoSinalizado', { detail });
    app.dispatchEvent(event);

    await page.waitForChanges();

    // Assert
    expect(onConteudoSinalizado.mock.calls[0][0].detail).toStrictEqual(detail);
  });

  it('exibe indicador de conteudo sinalizado no mobile', async () => {
    // Arrange
    setupMatchingMediaQuery(false);

    // É obrigatório ter ferramentas para o indicador ser exibido
    await page.setContent(`
      <bth-app>
        <section slot="${SLOT.FERRAMENTAS}"></section>
      </bth-app>
    `);

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');
    const detail = { possui: true, origem: 'nowhere' };
    const event: CustomEvent<ConteudoSinalizadoEvent> = new CustomEvent('conteudoSinalizado', { detail });
    app.dispatchEvent(event);

    await page.waitForChanges();

    // Assert
    const badge = app.shadowRoot.querySelector('.badge');
    expect(badge).not.toBeNull();
  });

  it('reage a evento de "menuHorizontalSelecionado"', async () => {
    // Arrange
    await page.setContent('<bth-app></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    app.opcoes = [
      { id: 123, descricao: 'Opção 1', rota: '/path', contador: 1 }
    ];

    const onOpcaoMenuSelecionada = jest.fn();
    app.addEventListener('opcaoMenuSelecionada', onOpcaoMenuSelecionada);

    const detail = { identificador: 123 };
    const event: CustomEvent<MenuHorizontalSelecionadoEvent> = new CustomEvent('menuHorizontalSelecionado', { detail });
    app.dispatchEvent(event);

    await page.waitForChanges();

    // Assert
    expect(onOpcaoMenuSelecionada.mock.calls[0][0].detail).toStrictEqual({
      id: app.opcoes[0].id,
      descricao: app.opcoes[0].descricao,
      rota: app.opcoes[0].rota,
      contador: app.opcoes[0].contador
    });
  });

  it('reage a evento de "menuVerticalSelecionado"', async () => {
    // Arrange
    await page.setContent('<bth-app menu-vertical></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    app.opcoes = [
      { id: 123, descricao: 'Opção 1', rota: '/path', contador: 1 }
    ];

    const onOpcaoMenuSelecionada = jest.fn();
    app.addEventListener('opcaoMenuSelecionada', onOpcaoMenuSelecionada);

    const detail = { identificador: 123 };
    const event: CustomEvent<MenuVerticalSelecionadoEvent> = new CustomEvent('menuVerticalSelecionado', { detail });
    app.dispatchEvent(event);

    await page.waitForChanges();

    // Assert
    expect(onOpcaoMenuSelecionada.mock.calls[0][0].detail).toStrictEqual({
      id: app.opcoes[0].id,
      descricao: app.opcoes[0].descricao,
      rota: app.opcoes[0].rota,
      contador: app.opcoes[0].contador
    });
  });

  it('reage a evento de "menuVerticalSelecionado" para opção que contém submenus', async () => {
    // Arrange
    await page.setContent('<bth-app menu-vertical></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    app.opcoes = [
      {
        id: 1, descricao: 'Opção 1', rota: '/um', submenus: [
          { id: 2, descricao: 'Opção 2', rota: '/dois' }
        ]
      }
    ];

    await page.waitForChanges();

    const menuVerticalItem: HTMLBthMenuVerticalItemElement = app.shadowRoot.querySelector('bth-menu-vertical-item');
    expect(menuVerticalItem.getAttribute('recolhido')).toBeNull();

    const detail = {
      identificador: app.opcoes[0].id
    };
    const event: CustomEvent<MenuVerticalSelecionadoEvent> = new CustomEvent('menuVerticalSelecionado', { detail });
    app.dispatchEvent(event);

    await page.waitForChanges();

    // Assert
    expect(menuVerticalItem.getAttribute('recolhido')).not.toBeNull();
  });

  it('reage a evento de "menuVerticalSelecionado" para submenus', async () => {
    // Arrange
    await page.setContent('<bth-app menu-vertical></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    app.opcoes = [
      {
        id: 1, descricao: 'Opção 1', rota: '/um', submenus: [
          { id: 2, descricao: 'Opção 2', rota: '/dois' }
        ]
      }
    ];

    const onOpcaoMenuSelecionada = jest.fn();
    app.addEventListener('opcaoMenuSelecionada', onOpcaoMenuSelecionada);

    const detail = {
      identificador: app.opcoes[0].submenus[0].id,
      identificadorPai: app.opcoes[0].id
    };
    const event: CustomEvent<MenuVerticalSelecionadoEvent> = new CustomEvent('menuVerticalSelecionado', { detail });
    app.dispatchEvent(event);

    await page.waitForChanges();

    // Assert
    expect(onOpcaoMenuSelecionada.mock.calls[0][0].detail).toStrictEqual({
      id: app.opcoes[0].submenus[0].id,
      descricao: app.opcoes[0].submenus[0].descricao,
      rota: app.opcoes[0].submenus[0].rota,
      contador: app.opcoes[0].submenus[0].contador
    });
  });

  it('emite evento "bannerAlterado" quando houver alterações no banner', async () => {
    // Arrange
    await page.setContent('<bth-app></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    const onBannerAlterado = jest.fn();
    app.addEventListener('bannerAlterado', onBannerAlterado);

    app.banner = { texto: '', link: '', tipo: 'warning' };

    await page.waitForChanges();

    // Assert
    expect(onBannerAlterado).toBeCalled();
  });

  it('não lança erro ao executar método "setMenuAtivo" passando id inexistente', async () => {
    // Arrange
    await page.setContent('<bth-app></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    app.opcoes = [
      { id: 123, descricao: 'Opção 1', rota: '/path', contador: 1 }
    ];

    const idInexistente = 432;
    app.setMenuAtivo(idInexistente);

    await page.waitForChanges();

    // Assert
    const menuHorizontalItem: HTMLBthMenuHorizontalItemElement = app.shadowRoot.querySelector('bth-menu-horizontal-item');
    expect(menuHorizontalItem.getAttribute('ativo')).toBeNull();
  });

  it('lança erro ao executar método "setMenuAtivo" para opção sem permissão', async () => {
    // Arrange
    await page.setContent('<bth-app></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    app.opcoes = [
      { id: 123, descricao: 'Opção 1', rota: '/path', contador: 1, possuiPermissao: false }
    ];

    try {
      await app.setMenuAtivo(app.opcoes[0].id);
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toBe(MSG_SEM_PERMISSAO_RECURSO);
    }
  });

  it('define item do menu horizontal como ativo através do método "setMenuAtivo"', async () => {
    // Arrange
    await page.setContent('<bth-app></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    app.opcoes = [
      { id: 123, descricao: 'Opção 1', rota: '/path', contador: 1 }
    ];

    app.setMenuAtivo(app.opcoes[0].id);

    await page.waitForChanges();

    // Assert
    const menuHorizontalItem: HTMLBthMenuHorizontalItemElement = app.shadowRoot.querySelector('bth-menu-horizontal-item');
    expect(menuHorizontalItem.getAttribute('ativo')).not.toBeNull();
  });

  it('define item do menu vertical como ativo através do método "setMenuAtivo"', async () => {
    // Arrange
    await page.setContent('<bth-app menu-vertical></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    app.opcoes = [
      { id: 123, descricao: 'Opção 1', rota: '/path', contador: 1 }
    ];

    app.setMenuAtivo(app.opcoes[0].id);

    await page.waitForChanges();

    // Assert
    const menuVerticalItem: HTMLBthMenuVerticalItemElement = app.shadowRoot.querySelector('bth-menu-vertical-item');
    expect(menuVerticalItem.getAttribute('ativo')).not.toBeNull();
  });

  it('define subitem do menu vertical como ativo através do método "setMenuAtivo"', async () => {
    // Arrange
    await page.setContent('<bth-app menu-vertical></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    app.opcoes = [
      {
        id: 1, descricao: 'Opção 1', rota: '/um', submenus: [
          { id: 2, descricao: 'Opção 2', rota: '/dois' }
        ]
      }
    ];

    app.setMenuAtivo(app.opcoes[0].submenus[0].id);

    await page.waitForChanges();

    // Assert
    const menuVerticalItem: HTMLBthMenuVerticalItemElement = app.shadowRoot.querySelector('bth-menu-vertical-item');
    expect(menuVerticalItem.getAttribute('ativo')).not.toBeNull();
  });

  it('define contador em item do menu horizontal através do método "setContadorMenu"', async () => {
    // Arrange
    await page.setContent('<bth-app></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    app.opcoes = [
      { id: 123, descricao: 'Opção 1', rota: '/path' }
    ];

    app.setContadorMenu(app.opcoes[0].id, 37);

    await page.waitForChanges();

    // Assert
    const menuHorizontalItem: HTMLBthMenuHorizontalItemElement = app.shadowRoot.querySelector('bth-menu-horizontal-item');
    expect(menuHorizontalItem.getAttribute('contador')).toBe('37');
  });

  it('define contador em item do menu vertical através do método "setContadorMenu"', async () => {
    // Arrange
    await page.setContent('<bth-app menu-vertical></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    app.opcoes = [
      { id: 123, descricao: 'Opção 1', rota: '/path' }
    ];

    app.setContadorMenu(app.opcoes[0].id, 37);

    await page.waitForChanges();

    // Assert
    const menuVerticalItem: HTMLBthMenuVerticalItemElement = app.shadowRoot.querySelector('bth-menu-vertical-item');
    expect(menuVerticalItem.getAttribute('contador')).toBe('37');
  });

  it('define contador em submenu de item do menu vertical através do método "setContadorMenu"', async () => {
    // Arrange
    page = await newSpecPage({
      components: [App, MenuVerticalItem],
      html: '<bth-app menu-vertical></bth-app>'
    });

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    app.opcoes = [
      {
        id: 1, descricao: 'Opção 1', rota: '/um', submenus: [
          { id: 2, descricao: 'Opção 2', rota: '/dois' }
        ]
      }
    ];

    app.setContadorMenu(app.opcoes[0].submenus[0].id, 37);

    await page.waitForChanges();

    // Assert
    const menuVerticalItem: HTMLBthMenuVerticalItemElement = app.shadowRoot.querySelector('bth-menu-vertical-item');
    const submenuVerticalItem: HTMLBthMenuVerticalItemElement = menuVerticalItem.shadowRoot.querySelector('bth-menu-vertical-item');
    expect(submenuVerticalItem.contador).toBe(37);
  });

  it('permite fixar o menu vertical em dispositivos desktop', async () => {
    // Arrange
    await page.setContent('<bth-app menu-vertical></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    app.opcoes = [
      { id: 123, descricao: 'Opção 1', rota: '/path' }
    ];
    await page.waitForChanges();

    const descritorFixar = app.shadowRoot.querySelector('.menu-vertical__item--floating span');
    // Assert antes
    expect(descritorFixar.textContent).toBe('Desafixar');

    const linkFixar: HTMLAnchorElement = app.shadowRoot.querySelector('.menu-vertical__item--floating a');
    linkFixar.click();

    await page.waitForChanges();

    // Assert depois
    expect(descritorFixar.textContent).toBe('Fixar');
  });

  it('permite alternar exibição do menu vertical através de botão no menu horizontal', async () => {
    // Arrange
    await page.setContent('<bth-app menu-vertical></bth-app>');

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    app.opcoes = [
      { id: 123, descricao: 'Opção 1', rota: '/path' }
    ];
    await page.waitForChanges();

    const alternarMenuVerticalLink: HTMLAnchorElement = app.shadowRoot.querySelector('.menu-vertical__toggle');
    expect(alternarMenuVerticalLink.classList.contains('menu-vertical__toggle--opened')).toBeTruthy();
    alternarMenuVerticalLink.click();

    await page.waitForChanges();

    // Assert depois
    expect(alternarMenuVerticalLink.classList.contains('menu-vertical__toggle--opened')).toBeFalsy();

    const asideMenuVertical: HTMLElement = app.shadowRoot.querySelector('.menu-vertical');
    expect(asideMenuVertical.classList.contains('menu-vertical--collapsed'));
  });

  it('permite alternar exibição do painel de ferramentas no mobile', async () => {
    // Arrange
    setupMatchingMediaQuery(false);
    await page.setContent(`
      <bth-app menu-vertical>
        <section slot="${SLOT.FERRAMENTAS}">Lorem Ipsum</section>
      </bth-app>
    `);

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    const alternarPainelFerramentas: HTMLAnchorElement = app.shadowRoot.querySelector('.menu-ferramentas__mobile-toggler');
    expect(alternarPainelFerramentas.classList.contains('menu-ferramentas__mobile-toggler--opened')).toBeFalsy();
    alternarPainelFerramentas.click();

    await page.waitForChanges();

    // Assert
    expect(alternarPainelFerramentas.classList.contains('menu-ferramentas__mobile-toggler--opened')).toBeTruthy();
  });

  it('renderiza sinalização pendente no toggler do painel de ferramentas no mobile', async () => {
    // Arrange
    setupMatchingMediaQuery(false);
    await page.setContent(`
      <bth-app menu-vertical>
        <section slot="${SLOT.FERRAMENTAS}">Lorem Ipsum</section>
      </bth-app>
    `);

    // Act
    const app: HTMLBthAppElement = page.doc.querySelector('bth-app');

    const detail = { possui: true, origem: 'nowhere' };
    const event: CustomEvent<ConteudoSinalizadoEvent> = new CustomEvent('conteudoSinalizado', { detail });
    app.dispatchEvent(event);

    await page.waitForChanges();

    // Assert
    const conteudoSinalizadoIndicadorMobile: HTMLAnchorElement = app.shadowRoot.querySelector('.menu-ferramentas__mobile-toggler .badge');
    expect(conteudoSinalizadoIndicadorMobile).not.toBeNull();
  });

});
