# FAQ

## Bower

Caso seja necessário instalar através do Bower, será necessário utilizar um _npm resolver_, [verificar documentação oficial](https://www.npmjs.com/package/bower-npm-resolver).

## Bundle por componente

Os componentes são distribuídos no formato de coleção através de um único arquivo que serve como entrada para registrar os componentes no navegador. A partir do momento em que os componentes estejam sendo utilizados no DOM, os seus respectivos _bundles_ são baixados, otimizando a performance das aplicações. [Veja mais sobre o mecanismo de lazy-loading do StencilJS](https://stenciljs.com/blog/how-lazy-loading-web-components-work)

## Task Runners: Grunt e Gulp

Em projetos mais antigos, onde o processo de distribuição é realizado por _task runners_ como o [**Grunt**](https://gruntjs.com/) ou [**Gulpjs**](https://gulpjs.com/), é necessário estar atento a cópia correta de todos os módulos disponíveis no `/dist` do projeto, evitando problemas com o mecanismo de [**lazy-loading** do Stenciljs](https://stenciljs.com/blog/how-lazy-loading-web-components-work)

*Module bundlers* modernos, como [**webpack**](https://webpack.js.org/) ou [**rollup**](https://rollupjs.org/), já resolvem automaticamente a importação desses módulos.

## Configurando Variáveis de Ambiente

Alguns componentes são autocontidos, necessitando somente de **variáveis de ambiente**, como URLs para serviços, que por padrão, são obtidas do `env.js` configurado no `window`. Entretanto é possível configurá-las através de propriedades caso não esteja sendo utilizado `env.js`.

## Fontes Customizadas

Por que é necessário instalar as fontes? Veja em ["Utilizando Fontes Customizadas em Web Components"](./fontes-customizadas.md)

