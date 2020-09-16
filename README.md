# @betha-plataforma/estrutura-componentes

Coleção de Web Components para compor a estrutura de uma aplicação front-end da Betha Sistemas.

Compatível com qualquer stack front-end que utilize HTML, CSS e JavaScript.

## Componentes 📦

### Estrutura

- [bth-app](http://github.com/betha-plataforma/estrutura-componentes/tree/master/src/components/app)
- [bth-menu-ferramenta](http://github.com/betha-plataforma/estrutura-componentes/tree/master/src/components/app/menu-ferramenta/)
- [bth-menu-ferramenta-icone](http://github.com/betha-plataforma/estrutura-componentes/tree/master/src/components/app/menu-ferramenta-icone)
- [bth-menu-painel-lateral](http://github.com/betha-plataforma/estrutura-componentes/tree/master/src/components/menu-painel-lateral)

### Marca e produto

- [bth-marca-produto](http://github.com/betha-plataforma/estrutura-componentes/tree/master/src/components/marca-produto)

### Ferramentas

- [bth-conta-usuario](http://github.com/betha-plataforma/estrutura-componentes/tree/master/src/components/conta-usuario)
- [bth-notificacoes](http://github.com/betha-plataforma/estrutura-componentes/tree/master/src/components/notificacoes)
- [bth-novidades](http://github.com/betha-plataforma/estrutura-componentes/tree/master/src/components/novidades)
- [bth-ajuda](http://github.com/betha-plataforma/estrutura-componentes/tree/master/src/components/ajuda)
- [bth-utilitarios](http://github.com/betha-plataforma/estrutura-componentes/tree/master/src/components/utilitarios)

## Instalando

### NPM

```
npm install @betha-plataforma/estrutura-componentes
```

### Yarn

```
yarn add @betha-plataforma/estrutura-componentes
```

### CDN (unpkg)

```html
<script type="module" src="https://unpkg.com/@betha-plataforma/estrutura-componentes/dist/estrutura-componentes/estrutura-componentes.esm.js"></script>
<script nomodule src="https://unpkg.com/@betha-plataforma/estrutura-componentes/dist/estrutura-componentes/estrutura-componentes.js"></script>
```

## Como usar 🔨

### Fonte

Deve conter a fonte [**Open Sans**](https://fonts.google.com/specimen/Open+Sans?selection.family=Open+Sans) instalada. 

- O [**Kare | Framework Design**](https://github.com/betha-plataforma/kare) já possui essa fonte e suas variações.

- Caso não utilize o framework, é possível obter as definições nos arquivos de distribuição ao instalar este projeto. 
  - `@betha-plataforma/estrutura-componentes/dist/collection/assets/fonts.css`

### Ícones

Deve conter a fonte [**Material Design Icons**](http://materialdesignicons.com/) instalada

- A versão suportada é a [**5.0.45**](https://github.com/Templarian/MaterialDesign)
- [Neste link](http://materialdesignicons.com/cdn/5.0.45/) está a tabela de referência de ícones disponíveis

Essa biblioteca de ícones pode ser instalada através de um gerenciador de pacotes 
  - Ex: `npm install @mdi/font@5.0.45`

### Estilos

Os estilos globais da biblioteca devem ser importados

- `@betha-plataforma/estrutura-componentes/dist/estrutura-componentes/estrutura-componentes.css`

### Registrando componentes

*A integração com frameworks frontend, pode exigir algumas configurações específicas.*

Abaixo alguns exemplos de como registrar e utilizar os web components

- [Vanilla JavaScript](http://github.com/betha-plataforma/estrutura-componentes/tree/master/docs/registrando-vanilla.md)
- [Angular](http://github.com/betha-plataforma/estrutura-componentes/tree/master/docs/registrando-angular.md)
- [Vue](http://github.com/betha-plataforma/estrutura-componentes/tree/master/docs/registrando-vue.md)
- [React](http://github.com/betha-plataforma/estrutura-componentes/tree/master/docs/registrando-react.md)

Mais informações sobre [integração com frameworks](https://stenciljs.com/docs/overview) podem ser vistas na documentação oficial do StencilJS

### Configurando componentes

A comunicação com os componentes é feita através de propriedades, atributos, métodos e eventos do DOM, e cada componente tem suas específicações documentadas individualmente, siga o [índice no topo deste documento](#componentes-) ou [navegue através dos diretórios para consultar](http://github.com/betha-plataforma/estrutura-componentes/tree/master/src/components).

## Compatibilidade 📜

Para entender melhor a abrangência de suporte entre navegadores, [consulte a tabela no site oficial do Stencil](https://stenciljs.com/docs/browser-support).

## Dúvidas

Possíveis dúvidas foram esclarecidas [nesta documentação](http://github.com/betha-plataforma/estrutura-componentes/tree/master/docs/FAQ.md)

## Contribuindo 👥

Contribua para a evolução dos componentes [Como contribuir](http://github.com/betha-plataforma/estrutura-componentes/tree/master/CONTRIBUTING.md).
