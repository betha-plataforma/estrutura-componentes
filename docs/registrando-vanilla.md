# Vanilla JavaScript

Registrando componentes em uma aplicação JavaScript sem nenhum framework.

A maneira mais simples de importar é através das tags `link` e `script` no index.html do projeto.

```html
<header>
  <!-- ... -->
  <link rel="stylesheet" href="[LIBS_PROJETO]/@betha-plataforma/estrutura-componentes/dist/estrutura-componentes/estrutura-componentes.css">

  <!-- Caso não possua as fontes -->
  <link rel="stylesheet" href="[LIBS_PROJETO]/@betha-plataforma/estrutura-componentes/dist/collection/assets/fonts.css">
  <!-- ... -->
</header>

<body>
  <!-- ... -->
  <script type="module" src="[LIBS_PROJETO]/@betha-plataforma/estrutura-componentes/dist/estrutura-componentes/estrutura-componentes.esm.js"></script>
  <script nomodule src="[LIBS_PROJETO]/@betha-plataforma/estrutura-componentes/dist/estrutura-componentes/estrutura-componentes.js"></script>
  <!-- ... -->
</body>
```

> ℹ️ [Entender o type="module" e nomodule dos arquivos JavaScript](./docs/importando-esmodules.md)
