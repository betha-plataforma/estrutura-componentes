import { newE2EPage, E2EPage } from '@stencil/core/testing';

describe('bth-avatar', () => {
  it('renderiza', async () => {
    const page = await newE2EPage();
    await page.setContent('<bth-avatar></bth-avatar>');

    const element = await page.find('bth-avatar');
    expect(element).toHaveClass('hydrated');
  });

  it('renderiza corretamente as iniciais', async () => {
    const page: E2EPage = await newE2EPage();
    // await page.setContent('<bth-avatar iniciais="End-to-end Testing"></bth-avatar>');
    // await page.compareScreenshot('Avatar com iniciais ET', { fullPage: false });

    // In order to test against any global styles you may have, don't forget to set the link to the global css. You odn't have to do this if your stencil.config.ts file doesn't build a global css file with globalStyle.
    // <link href="http://localhost:3333/build/estrutura-componentes.css" rel="stylesheet">
    await page.setContent(`
      <bth-avatar iniciais="End-to-end Testing"></bth-avatar>
    `);

    const element = await page.find('bth-avatar');
    expect(element).toHaveClass('hydrated');

    // To start comparing the visual result, you first must run page.compareScreenshot; This will capture a screenshot, and save the file to "/screenshot/images". You'll be able to check that into your repo to provide those results to your team. You can only have one of these commands per test.
    const results = await page.compareScreenshot();

    // Finally, we can test against the previous screenshots.
    // Test against hard pixels
    expect(results).toMatchScreenshot({ allowableMismatchedPixels: 100 });

    // Test against the percentage of changes. if 'allowableMismatchedRatio' is above 20% changed,
    expect(results).toMatchScreenshot({ allowableMismatchedRatio: 0.2 });
  });
});
