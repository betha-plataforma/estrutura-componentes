import { newE2EPage } from '@stencil/core/testing';

describe('bth-rede', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<bth-rede></bth-rede>');

    const element = await page.find('bth-rede');
    expect(element).toHaveClass('hydrated');
  });
});
