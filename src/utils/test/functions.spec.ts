import { isNill, getCssVariableValue } from '../functions';

describe('Functions', () => {
  it('obtém valor de variavel de css', () => {
    const valorEsperado = 'blue';

    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({
        getPropertyValue: () => valorEsperado
      })
    });

    const valorResultante = getCssVariableValue('--bth-minha-variavel');
    expect(valorResultante).not.toBeNull();
    expect(valorResultante).toEqual(valorEsperado);
  });

  it('valida que null é nill', () => {
    expect(isNill(null)).toBeTruthy();
  });

  it('valida que undefined é nill', () => {
    expect(isNill(undefined)).toBeTruthy();
  });

  it('valida valores que não são nill', () => {
    expect(isNill(1)).toBeFalsy();
    expect(isNill({})).toBeFalsy();
    expect(isNill([])).toBeFalsy();
    expect(isNill('')).toBeFalsy();
  });

});
