# Importando ES Modules

O StencilJS gera automaticamente diferentes _bundles_ em seu processo de build, gerando código para navegadores mais modernos, mas também para navegadores legados (IE11).

A vantagem desta técnica é permitir importar somente os arquivos mais otimizados em navegadores mais novos e importar os _polyfills_ necessários somente em navegadores mais antigos.

```html
<!-- JavaScript atual e otimizado, com funcionalidades como ES Modules, Dynamic Imports, async/await, Classes, etc -->
<script type="module" src="script.esm.js"></script>

<!-- JavaScript compatível com ES5 contendo todos os polyfills necessários -->
<script nomodule src="script.js"></script>
```

No _snippet_ o script que possui o [atributo nomodule](https://html.spec.whatwg.org/multipage/scripting.html#attr-script-nomodule) não é executado quando o browser já suporta scripts `type="module"`, sendo executado somente em browsers mais antigos que não suportam o `type="module"`.

Mais informações em:

- [Output Targets - Differential Bundling](https://stenciljs.com/docs/output-targets#differential-bundling)
