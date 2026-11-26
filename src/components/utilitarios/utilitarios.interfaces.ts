export interface Utilitario {
  nome: string,
  icone: string,
  rota: string,
  possuiPermissao?: boolean,
}

export interface UtilitarioCentral extends Utilitario {
  id: string,
}

export interface OpcaoUtilitarioSelecionadaEvent {
  nome: string,
  icone: string,
  rota: string,
}
