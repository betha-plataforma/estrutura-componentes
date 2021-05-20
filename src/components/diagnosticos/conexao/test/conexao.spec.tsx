import { newSpecPage } from '@stencil/core/testing';
import { Conexao } from '../conexao';

describe('bth-conexao', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [Conexao],
      html: `<bth-conexao></bth-conexao>`,
    });
    expect(page.root).toEqualHtml(`
      <bth-conexao>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </bth-conexao>
    `);
  });
});
