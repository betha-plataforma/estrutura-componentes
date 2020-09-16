# Angular

Registrando componentes em uma aplicação Angular

## Importando estilos no Angular

`angular.json`

```json
"architect" {
  ...
  "options": {
    ...
    "styles": [
      "node_modules/@betha-plataforma/estrutura-componentes/dist/estrutura-componentes/estrutura-componentes.css",
      "src/styles.css"
    ]
    ...
  }
  ...
}
```

## Registrando componentes no Angular

É necessário incluir o `CUSTOM_ELEMENTS_SCHEMA` no módulo que será utilizado, assim o compilador irá permitir o uso de web components nos _markups_.

Em `app.module.ts`

```ts
import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

Em `main.ts`

```ts
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// O método "applyPolyfills" é necessário ser invocado caso queira suportar IE11 e Edge
import { applyPolyfills, defineCustomElements } from '@betha-plataforma/estrutura-componentes/loader';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.log(err));

applyPolyfills().then(() => {
  defineCustomElements(window);
});
```

Após efetuar as configurações acima, os componentes estão prontos para uso.