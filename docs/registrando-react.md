# React

`index.js`

```ts
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

// O método "applyPolyfills" é necessário ser invocado caso queira suportar IE11 e Edge
import { applyPolyfills, defineCustomElements } from '@betha-plataforma/estrutura-componentes/loader';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

applyPolyfills().then(() => {
  defineCustomElements(window);
});
```
