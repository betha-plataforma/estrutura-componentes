import { h } from '@stencil/core';

export default (props: any) => {
  if (props === undefined || props.contador === undefined || props.contador === 0) {
    return undefined;
  }

  return (
    <span class="badge">
      {props.contador > 99 ? '99+' : props.contador}
    </span>
  );
};
