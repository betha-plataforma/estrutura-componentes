import { newSpecPage, SpecPage } from '@stencil/core/testing';

import { getDataHoraDescrita } from '../../../../utils/date';
import { TipoNotificacao } from '../../notificacoes.interfaces';
import { NotificacaoItem } from '../notificacao-item';

describe('notificacao-item', () => {
  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({
      components: [NotificacaoItem]
    });
  });

  it('renderiza lida', async () => {
    // Arrange
    await page.setContent('<bth-notificacao-item></bth-notificacao-item>');

    // Act
    const notificacaoItem: HTMLBthNotificacaoItemElement = page.doc.querySelector('bth-notificacao-item');
    notificacaoItem.tipo = TipoNotificacao.Lida;
    await page.waitForChanges();

    // Assert
    expect(page.root).not.toBeNull();

    const notificationBlock: HTMLDivElement = notificacaoItem.shadowRoot.querySelector('.notificacao');
    expect(notificationBlock.classList.contains('notificacao--unread')).toBe(false);
  });

  it('renderiza não lida', async () => {
    // Arrange
    await page.setContent('<bth-notificacao-item></bth-notificacao-item>');

    // Act
    const notificacaoItem: HTMLBthNotificacaoItemElement = page.doc.querySelector('bth-notificacao-item');
    notificacaoItem.tipo = TipoNotificacao.NaoLida;
    await page.waitForChanges();

    // Assert
    expect(page.root).not.toBeNull();

    const notificationBlock: HTMLDivElement = notificacaoItem.shadowRoot.querySelector('.notificacao');
    expect(notificationBlock.classList.contains('notificacao--unread')).toBe(true);
  });

  it('renderiza em progresso', async () => {
    // Arrange
    await page.setContent('<bth-notificacao-item></bth-notificacao-item>');

    // Act
    const notificacaoItem: HTMLBthNotificacaoItemElement = page.doc.querySelector('bth-notificacao-item');
    notificacaoItem.tipo = TipoNotificacao.Progresso;
    notificacaoItem.status = 'OPEN';
    notificacaoItem.prioridade = 1;
    await page.waitForChanges();

    // Assert
    expect(page.root).not.toBeNull();

    const notificationBlock: HTMLDivElement = notificacaoItem.shadowRoot.querySelector('.notificacao');
    expect(notificationBlock.classList.contains('notificacao--unread')).toBe(false);
  });

  it('renderiza texto', async () => {
    // Arrange
    await page.setContent('<bth-notificacao-item></bth-notificacao-item>');

    // Act
    const notificacaoItem: HTMLBthNotificacaoItemElement = page.doc.querySelector('bth-notificacao-item');
    const texto = 'Texto da Notificação';
    notificacaoItem.texto = texto;
    await page.waitForChanges();

    // Assert
    expect(notificacaoItem.texto).toBe(texto);

    const paragrafoTexto = notificacaoItem.shadowRoot.querySelector('.mensagem');
    expect(paragrafoTexto.textContent).toBe(texto);
  });

  it('renderiza icone conforme origem', async () => {
    // Arrange
    await page.setContent('<bth-notificacao-item></bth-notificacao-item>');

    // Act
    const notificacaoItem: HTMLBthNotificacaoItemElement = page.doc.querySelector('bth-notificacao-item');
    const origem = 'system@gen';
    notificacaoItem.origem = 'system@gen';
    await page.waitForChanges();

    // Assert
    expect(notificacaoItem.origem).toBe(origem);

    const icone: HTMLBthIconeElement = notificacaoItem.shadowRoot.querySelector('.icon bth-icone');

    // O source "gen" utiliza o ícone "bell" (ver em: "../../notificacoes-sistemas.config.ts")
    expect(icone.getAttribute('icone')).toBe('bell');
  });

  it('exibe link resultado', async () => {
    // Arrange
    await page.setContent('<bth-notificacao-item></bth-notificacao-item>');

    // Act
    const notificacaoItem: HTMLBthNotificacaoItemElement = page.doc.querySelector('bth-notificacao-item');
    const resultadoLink = {
      href: 'https://www.google.com/',
      label: 'Resultado',
      target: 'BLANK',
      title: 'Visualizar resultado'
    };

    notificacaoItem.resultadoLink = resultadoLink;
    await page.waitForChanges();

    // Assert
    expect(notificacaoItem.resultadoLink).toBe(resultadoLink);

    const linkResultado: HTMLAnchorElement = notificacaoItem.shadowRoot.querySelector('.notificacao__footer a');
    expect(linkResultado).toBeDefined();
    expect(linkResultado.href).toBe(resultadoLink.href);
    expect(linkResultado.title).toBe(resultadoLink.title);
    expect(linkResultado.textContent).toBe(resultadoLink.label);
    expect(linkResultado.getAttribute('target')).toBe('_blank');
  });

  it('exibe link acompanhar', async () => {
    // Arrange
    await page.setContent('<bth-notificacao-item></bth-notificacao-item>');

    // Act
    const notificacaoItem: HTMLBthNotificacaoItemElement = page.doc.querySelector('bth-notificacao-item');
    const acompanharLink = {
      href: 'https://www.google.com/',
      target: 'BLANK',
      title: 'Acompanhar o progresso'
    };

    notificacaoItem.acompanharLink = acompanharLink;
    notificacaoItem.status = 'OPEN';
    await page.waitForChanges();

    // Assert
    expect(notificacaoItem.acompanharLink).toBe(acompanharLink);

    const linkAcompanhar: HTMLAnchorElement = notificacaoItem.shadowRoot.querySelector('.notificacao__footer a');
    expect(linkAcompanhar).toBeDefined();
    expect(linkAcompanhar.href).toBe(acompanharLink.href);
    expect(linkAcompanhar.title).toBe(acompanharLink.title);
    expect(linkAcompanhar.textContent).toBe('Acompanhar');
    expect(linkAcompanhar.getAttribute('target')).toBe('_blank');
  });

  it('exibe link cancelar', async () => {
    // Arrange
    await page.setContent('<bth-notificacao-item></bth-notificacao-item>');

    // Act
    const notificacaoItem: HTMLBthNotificacaoItemElement = page.doc.querySelector('bth-notificacao-item');
    const cancelamentoLink = {
      href: 'https://www.google.com/',
      target: 'BLANK',
      title: 'Cancelar operação'
    };

    notificacaoItem.cancelamentoLink = cancelamentoLink;
    notificacaoItem.status = 'OPEN';
    await page.waitForChanges();

    // Assert
    expect(notificacaoItem.cancelamentoLink).toBe(cancelamentoLink);

    const linkAcompanhar: HTMLAnchorElement = notificacaoItem.shadowRoot.querySelector('.notificacao__footer a');
    expect(linkAcompanhar).toBeDefined();
    expect(linkAcompanhar.href).toBe(cancelamentoLink.href);
    expect(linkAcompanhar.title).toBe(cancelamentoLink.title);
    expect(linkAcompanhar.textContent).toBe('Cancelar');
    expect(linkAcompanhar.getAttribute('target')).toBe('_blank');
  });

  it('exibe data e hora', async () => {
    // Arrange
    await page.setContent('<bth-notificacao-item></bth-notificacao-item>');

    // Act
    const notificacaoItem: HTMLBthNotificacaoItemElement = page.doc.querySelector('bth-notificacao-item');
    const dataHora = 1588008762990;
    notificacaoItem.dataHora = dataHora;
    await page.waitForChanges();

    // Assert
    expect(notificacaoItem.dataHora).toBe(dataHora);

    const blocoDataHora = notificacaoItem.shadowRoot.querySelector('span.float-right');
    expect(blocoDataHora.textContent).toBe(getDataHoraDescrita(dataHora));
  });

  it('exibe progresso indeterminado (sem percentual)', async () => {
    // Arrange
    await page.setContent('<bth-notificacao-item></bth-notificacao-item>');

    // Act
    const notificacaoItem: HTMLBthNotificacaoItemElement = page.doc.querySelector('bth-notificacao-item');
    notificacaoItem.prioridade = 1;
    notificacaoItem.status = 'OPEN';
    notificacaoItem.possuiProgresso = false;
    await page.waitForChanges();

    // Assert
    const blocoProgresso = notificacaoItem.shadowRoot.querySelector('.notificacao__progress');
    expect(blocoProgresso.classList.contains('notificacao__progress--indeterminate')).toBeTruthy();
  });

  it('exibe progresso determinado (com percentual)', async () => {
    // Arrange
    await page.setContent('<bth-notificacao-item></bth-notificacao-item>');

    // Act
    const notificacaoItem: HTMLBthNotificacaoItemElement = page.doc.querySelector('bth-notificacao-item');
    notificacaoItem.prioridade = 1;
    notificacaoItem.status = 'OPEN';
    notificacaoItem.possuiProgresso = true;
    notificacaoItem.percentualProgresso = 33;
    await page.waitForChanges();

    // Assert
    const blocoProgresso = notificacaoItem.shadowRoot.querySelector('.notificacao__progress');
    expect(blocoProgresso.classList.contains('notificacao__progress--success')).toBeTruthy();

    const blocoPercentual = blocoProgresso.querySelector('.notificacao__progress__percent');
    expect(blocoPercentual.textContent).toBe('33%');
  });

  it('emite evento ao marcar notificação como lida', async () => {
    // Arrange
    await page.setContent('<bth-notificacao-item></bth-notificacao-item>');

    const notificacaoItem: HTMLBthNotificacaoItemElement = page.doc.querySelector('bth-notificacao-item');
    notificacaoItem.tipo = TipoNotificacao.NaoLida;

    const identificador = 'lorem1234';
    notificacaoItem.identificador = identificador;

    await page.waitForChanges();

    let onNotificacaoLida = jest.fn();
    page.root.addEventListener('notificacaoLida', onNotificacaoLida);

    // Act
    const marcarComoLida: HTMLAnchorElement = notificacaoItem.shadowRoot.querySelector('.notificacao__body a');
    marcarComoLida.click();

    await page.waitForChanges();

    // Assert
    expect(onNotificacaoLida).toHaveBeenCalled();
    expect(onNotificacaoLida.mock.calls[0][0].detail).toStrictEqual({ id: identificador });
  });

  it('emite evento ao marcar notificação como lida através do painel', async () => {
    // Arrange
    await page.setContent('<bth-notificacao-item></bth-notificacao-item>');

    const notificacaoItem: HTMLBthNotificacaoItemElement = page.doc.querySelector('bth-notificacao-item');
    notificacaoItem.tipo = TipoNotificacao.NaoLida;

    const identificador = 'lorem1234';
    notificacaoItem.identificador = identificador;

    await page.waitForChanges();

    let onNotificacaoLida = jest.fn();
    page.root.addEventListener('notificacaoLida', onNotificacaoLida);

    // Act
    const marcarComoLida: HTMLElement = notificacaoItem.shadowRoot.querySelector('.notificacao');
    marcarComoLida.click();

    await page.waitForChanges();

    // Assert
    expect(onNotificacaoLida).toHaveBeenCalled();
    expect(onNotificacaoLida.mock.calls[0][0].detail).toStrictEqual({ id: identificador });
  });

  it('emite evento (com link resultado) ao marcar notificação como lida', async () => {
    // Arrange
    await page.setContent('<bth-notificacao-item></bth-notificacao-item>');

    const notificacaoItem: HTMLBthNotificacaoItemElement = page.doc.querySelector('bth-notificacao-item');
    notificacaoItem.tipo = TipoNotificacao.NaoLida;

    const identificador = 'lorem1234';
    notificacaoItem.identificador = identificador;

    const resultadoLink = {
      href: 'https://www.google.com/',
      label: 'Resultado',
      target: 'BLANK',
      title: 'Visualizar resultado'
    };
    notificacaoItem.resultadoLink = resultadoLink;

    await page.waitForChanges();

    let onNotificacaoLida = jest.fn();
    page.root.addEventListener('notificacaoLida', onNotificacaoLida);

    // Act
    const marcarComoLida: HTMLAnchorElement = notificacaoItem.shadowRoot.querySelector('.notificacao__body a');
    marcarComoLida.click();

    await page.waitForChanges();

    // Assert
    expect(onNotificacaoLida).toHaveBeenCalled();
    expect(onNotificacaoLida.mock.calls[0][0].detail).toStrictEqual({
      id: identificador,
      url: resultadoLink.href,
      target: '_blank'
    });
  });

  it('emite evento ao marcar notificação como não lida', async () => {
    // Arrange
    await page.setContent('<bth-notificacao-item></bth-notificacao-item>');

    const notificacaoItem: HTMLBthNotificacaoItemElement = page.doc.querySelector('bth-notificacao-item');
    notificacaoItem.tipo = TipoNotificacao.Lida;

    const identificador = 'lorem1234';
    notificacaoItem.identificador = identificador;

    await page.waitForChanges();

    let onNotificacaoNaoLida = jest.fn();
    page.root.addEventListener('notificacaoNaoLida', onNotificacaoNaoLida);

    // Act
    const marcarComoLida: HTMLAnchorElement = notificacaoItem.shadowRoot.querySelector('.notificacao__body a');
    marcarComoLida.click();

    await page.waitForChanges();

    // Assert
    expect(onNotificacaoNaoLida).toHaveBeenCalled();
    expect(onNotificacaoNaoLida.mock.calls[0][0].detail).toStrictEqual({ id: identificador });
  });

});
