import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { setBethaEnvs } from '../../../../test/utils/spec.helper';
import { ContaUsuario } from '../conta-usuario';

describe('conta-usuario', () => {

  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({ components: [ContaUsuario] });
  });

  it('renderiza avatar desktop', async () => {
    // Arrange
    await page.setContent('<bth-conta-usuario></bth-conta-usuario>');

    // Act
    const fotoUrl = 'https://static.betha.cloud/usuarios/lorem.ipsum';
    const contaUsuario: HTMLBthContaUsuarioElement = page.doc.querySelector('bth-conta-usuario');
    contaUsuario.setAttribute('foto-url', fotoUrl);
    await page.waitForChanges();

    // Assert
    expect(contaUsuario).not.toBeNull();

    const avatar: HTMLBthAvatarElement = contaUsuario.shadowRoot.querySelector('.avatar-desktop');
    expect(avatar).not.toBeNull();
    expect(avatar.getAttribute('src')).toBe(fotoUrl);
  });

  it('renderiza avatar mobile', async () => {
    // Arrange
    await page.setContent('<bth-conta-usuario></bth-conta-usuario>');

    // Act
    const fotoUrl = 'https://static.betha.cloud/usuarios/lorem.ipsum';
    const contaUsuario: HTMLBthContaUsuarioElement = page.doc.querySelector('bth-conta-usuario');
    contaUsuario.setAttribute('foto-url', fotoUrl);
    await page.waitForChanges();

    expect(contaUsuario).not.toBeNull();

    const avatar: HTMLBthAvatarElement = contaUsuario.shadowRoot.querySelector('.avatar-mobile');
    expect(avatar).not.toBeNull();
    expect(avatar.getAttribute('src')).toBe(fotoUrl);
  });

  it('renderiza descrição mobile', async () => {
    // Arrange
    await page.setContent('<bth-conta-usuario></bth-conta-usuario>');

    // Act
    const nome = 'Lorem Ipsum';
    const usuario = 'lorem.ipsum';
    const contaUsuario: HTMLBthContaUsuarioElement = page.doc.querySelector('bth-conta-usuario');
    contaUsuario.setAttribute('nome', nome);
    contaUsuario.setAttribute('usuario', usuario);
    await page.waitForChanges();

    // Assert
    const perfilUsuarioNome: HTMLSpanElement = contaUsuario.shadowRoot.querySelector('[slot=menu_descricao_mobile] span.perfil-usuario__nome');
    expect(perfilUsuarioNome).not.toBeNull();
    expect(perfilUsuarioNome.textContent).toBe(nome);

    const perfilUsuarioId: HTMLSpanElement = contaUsuario.shadowRoot.querySelector('[slot=menu_descricao_mobile] span.perfil-usuario__id');
    expect(perfilUsuarioId).not.toBeNull();
    expect(perfilUsuarioId.textContent).toMatch(`@${usuario}`);
  });

  it('renderiza conteúdo painel lateral com informações do perfil do usuário', async () => {
    // Arrange
    await page.setContent('<bth-conta-usuario></bth-conta-usuario>');

    // Act
    const nome = 'Lorem Ipsum';
    const usuario = 'lorem.ipsum';
    const fotoUrl = 'https://static.betha.cloud/usuarios/lorem.ipsum';
    const contaUsuario: HTMLBthContaUsuarioElement = page.doc.querySelector('bth-conta-usuario');
    contaUsuario.setAttribute('nome', nome);
    contaUsuario.setAttribute('usuario', usuario);
    contaUsuario.setAttribute('foto-url', fotoUrl);
    await page.waitForChanges();

    // Assert
    const avatar: HTMLBthAvatarElement = contaUsuario.shadowRoot.querySelector('[slot=conteudo_painel_lateral] bth-avatar');
    expect(avatar).not.toBeNull();
    expect(avatar.getAttribute('src')).toBe(fotoUrl);

    const perfilUsuarioNome: HTMLSpanElement = contaUsuario.shadowRoot.querySelector('[slot=conteudo_painel_lateral] span.perfil-usuario__nome');
    expect(perfilUsuarioNome).not.toBeNull();
    expect(perfilUsuarioNome.textContent).toBe(nome);

    const perfilUsuarioId: HTMLSpanElement = contaUsuario.shadowRoot.querySelector('[slot=conteudo_painel_lateral] span.perfil-usuario__id');
    expect(perfilUsuarioId).not.toBeNull();
    expect(perfilUsuarioId.textContent).toMatch(`@${usuario}`);
  });

  it('permite acessar URL da central através do link "Editar" quando obtida pelo env.js', async () => {
    // Arrange
    const centralUsuarioHost = 'https://central.usuarios.betha.cloud';
    setBethaEnvs({ suite: { 'central-usuarios': { v1: { host: centralUsuarioHost } } } });

    await page.setContent('<bth-conta-usuario></bth-conta-usuario>');

    // Act
    const contaUsuario: HTMLBthContaUsuarioElement = page.doc.querySelector('bth-conta-usuario');
    await page.waitForChanges();

    // Assert
    const linkEditar: HTMLAnchorElement = contaUsuario.shadowRoot.querySelector('[slot=conteudo_painel_lateral] a[title="Editar"]');
    expect(linkEditar).not.toBeNull();
    expect(linkEditar.getAttribute('href')).toBe(centralUsuarioHost);
  });

  it('permite acessar URL da central através do link "Editar" quando obtida pelo atributo', async () => {
    // Arrange
    const centralUsuarioHost = 'https://central.usuarios.betha.cloud';
    await page.setContent(`<bth-conta-usuario central-usuario-home=${centralUsuarioHost}></bth-conta-usuario>`);

    // Act
    const contaUsuario: HTMLBthContaUsuarioElement = page.doc.querySelector('bth-conta-usuario');
    await page.waitForChanges();

    // Assert
    const linkEditar: HTMLAnchorElement = contaUsuario.shadowRoot.querySelector('[slot=conteudo_painel_lateral] a[title="Editar"]');
    expect(linkEditar).not.toBeNull();
    expect(linkEditar.getAttribute('href')).toBe(centralUsuarioHost);
  });

  it('emite evento de logout ao clicar no link de "Sair"', async () => {
    // Arrange
    await page.setContent('<bth-conta-usuario></bth-conta-usuario>');

    const contaUsuario: HTMLBthContaUsuarioElement = page.doc.querySelector('bth-conta-usuario');

    const usuario = 'lorem.ipsum';
    const nome = 'Lorem Ipsum';
    contaUsuario.setAttribute('usuario', usuario);
    contaUsuario.setAttribute('nome', nome);

    let onLogout = jest.fn();
    contaUsuario.addEventListener('logout', onLogout);

    // Act
    const linkSair: HTMLAnchorElement = contaUsuario.shadowRoot.querySelector('[slot=conteudo_painel_lateral] a[title="Sair"]');
    linkSair.click();
    await page.waitForChanges();

    // Assert
    expect(onLogout).toHaveBeenCalled();
    expect(onLogout.mock.calls[0][0].detail).toStrictEqual({ usuario, nome });
  });

});
