import { h } from '@stencil/core';

type BadgeContadorProps = {
  valor: number;
  customClass?: string
}

export default function BadgeContador({ valor, customClass }: BadgeContadorProps) {
  if (valor === undefined || valor <= 0) {
    return undefined;
  }

  const valorExibir = valor > 99 ? '99+' : valor;

  return (
    <div class={`badge ${customClass !== undefined ? customClass : ''}`} title={valorExibir.toString()}>{valorExibir}</div>
  );
}
