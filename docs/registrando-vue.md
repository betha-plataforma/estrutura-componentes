# Vue

`main.js`

```js
import Vue from 'vue';
import App from './App.vue';

import { applyPolyfills, defineCustomElements } from '@betha-plataforma/estrutura-componentes/loader';

Vue.config.productionTip = false;

// Indicando ao Vue para ignorar customElement tags da coleção
// Ver mais em https://vuejs.org/v2/api/#ignoredElements
Vue.config.ignoredElements = [/bth-\w*/];

applyPolyfills().then(() => {
  defineCustomElements(window);
});

new Vue({
  render: h => h(App)
}).$mount('#app');
```

[💡 Acesse um projeto de demonstração com Vue](../showcase/vue)
