import { E2EElement } from '@stencil/core/testing';

import { FiltroNovidade } from '../../novidades.interfaces';

export function expectFiltroAtivoPorDescricao(navbarPillItens: E2EElement[], filtroNovidade: FiltroNovidade) {
  navbarPillItens.forEach(async (novidadeFiltro) => {
    if (await novidadeFiltro.getProperty('identificador') === filtroNovidade.toString()) {
      const ativo = await novidadeFiltro.getProperty('ativo');
      expect(ativo).toBeTruthy();
    }
  });
}

/**
 * @description Injeta o Authorization no componente Novidades
 *
 * Este método deve ser JavaScript puro visto que irá executar no contexto do browser via page.evaluate.
 */
export function injectAuthorization() {
  const novidades = document.querySelector('bth-novidades');
  // @ts-ignore
  novidades.authorization = window.authorization;
}

/**
 * @description Seleciona o filtro de novidades lidas.
 *
 * Este método deve ser JavaScript puro visto que irá executar no contexto do browser via page.evaluate.
 */
export function selectFiltroLidas() {
  const novidades = document.querySelector('bth-novidades');

  const navbarPillItens = novidades.shadowRoot.querySelectorAll('bth-navbar-pill-item');
  navbarPillItens.forEach(navbarPillItem => {
    if (navbarPillItem.descricao === 'Lidas') {
      const link = navbarPillItem.shadowRoot.querySelector('a');
      link.click();
    }
  });
}
