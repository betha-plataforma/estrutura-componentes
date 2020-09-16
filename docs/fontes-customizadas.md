# Shadow DOM e Fontes Customizadas

Um dos pilares de Web Components é o [Shadow DOM](https://developers.google.com/web/fundamentals/web-components/shadowdom)
que nos permite desenvolver **estilos de maneira isolada aos componentes** sem nos preocuparmos com convenções de nomenclatura,
com vazamento de estilos sobre as páginas que usam os componentes e até mesmo simplificando nomes de seletores CSS, entre outras funcionalidades bastante importante, como composição de _markups_ através de _slots_.

Com o Stencil, não necessáriamente precisamos utilizar o Shadow DOM, eles disponibilizam outros recursos como o _scoped stylesheets_ ou nenhum isolamento sequer. Mas, sabendo dos benefícios do isolamento, foi optado por utilizar.

## Declaração de Fontes

Durante o desenvolvimento de um componente que definia e usava uma fonte de ícones (Material Design Icons) foi percebido que a fonte não era carregada, mesmo definindo corretamente através da diretiva de estilo **@font-face**, isso ocorre devido à diretiva de carregamento de fontes não funcionar conforme o esperado dentro de um componente que utiliza o Shadow DOM.

A solução encontrada foi a definição dessa fonte no documento principal (`index.html`) que estará fazendo o uso dos componentes, desta maneira, o browser consegue carregar e definir a fonte, seja ela encontrada localmente na máquina do usuário ou vinda de um servidor remoto, assim ela passa a ser reconhecida através do **font-family** do documento.

Não foi encontrado nenhuma declaração oficial de algum dos principais navegadores do porquê este comportamento ocorre e se um dia irá mudar, visto que na especificação não há nada especificamente disso.

## Exemplo não funcionando

```html
<html>
  <head>
    <!-- ... -->
  </head>
  <body>
    <script>
      class MeuComponente extends HTMLElement {
        constructor() {
          super();
        }

        connectedCallback() {
          const styles = `
           @font-face {
              font-family: 'Open Sans';
              src: local('Open Sans Regular'), local('OpenSans-Regular'), url('./assets/fonts/OpenSans-Regular.ttf') format('truetype');
              font-style: normal;
              font-weight: 400;
            }

            * {
              font-family: 'Open Sans', 'Times New Roman';
            }
          `

          const shadowRoot = this.attachShadow({ mode: 'open' });
          shadowRoot.innerHTML = `
            <style>${styles}</style>
            <p>Este texto é do componente</p>
            <slot></slot>
          `;
        }
      }

      window.customElements.define('meu-componente', MeuComponente)
    </script>

    <p>Este texto está no corpo do index.html</p>

    <meu-componente>Este texto está em um slot do componente</meu-componente>
  </body>
</html>
```

## Exemplo funcionando

```html
<html>
  <head>
    <!-- ... -->
  </head>
  <body>

    <!-- Definição da Fonte -->
    <style>
      @font-face {
        font-family: 'Open Sans';
        src: local('Open Sans Regular'), local('OpenSans-Regular'), url('./assets/fonts/OpenSans-Regular.ttf') format('truetype');
        font-style: normal;
        font-weight: 400;
      }
    </style>

    <script>
      class MeuComponente extends HTMLElement {
        constructor() {
          super();
        }

        connectedCallback() {
          const styles = `* { font-family: 'Open Sans', 'Times New Roman'; }`
          const shadowRoot = this.attachShadow({ mode: 'open' });
          shadowRoot.innerHTML = `
            <style>${styles}</style>
            <p>Este texto é do componente</p>
            <slot></slot>
          `;
        }
      }

      window.customElements.define('meu-componente', MeuComponente)
    </script>

    <p>Este texto está no corpo do index.html</p>

    <meu-componente>Este texto está em um slot do componente</meu-componente>
  </body>
</html>
```

## Threads/Issues

- [W3C - [css-scoping] Scoping @font-face defined in shadow DOM](https://lists.w3.org/Archives/Public/www-style/2015Nov/0186.html#options3)
- [Issue 336876: @font-face definitions in shadowRoot cannot be used within the shadowRoot](https://bugs.chromium.org/p/chromium/issues/detail?id=336876)
- [@font-face doesn't work with Shadow DOM?](https://github.com/mdn/interactive-examples/issues/887)

___

- [StencilJS Custom Fonts not working #2072](https://github.com/ionic-team/stencil/issues/2072)
- [Prev/next icons don't render within shadow DOM #3400](https://github.com/nolimits4web/swiper/issues/3400)
