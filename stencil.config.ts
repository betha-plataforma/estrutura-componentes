import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'estrutura-componentes',
  globalStyle: 'src/styles/global.css',
  taskQueue: 'async',// 'congestionAsync',
  plugins: [
    sass(),
  ],
  devServer: {
    reloadStrategy: 'pageReload',
    port: 3333,
  },
  testing: {
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
    coveragePathIgnorePatterns: [".mock.ts", ".helper.ts"]
  },
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      copy: [
        { src: 'assets/', warn: true }
      ]
    },
    {
      type: 'docs-readme',
      footer: 'Esta documentação é gerada automáticamente pelo StencilJS =)',
    },
    {
      type: 'www',
      serviceWorker: null,
      copy: [
        { src: 'comuns.html', dest: 'comuns.html' }
      ]
    }
  ],
  preamble: '(C) Betha Sistemas - Plataforma | http://plataforma.betha.cloud - MIT License',
};
