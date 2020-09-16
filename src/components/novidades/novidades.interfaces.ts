
export enum FiltroNovidade {
  Lida = 'Lida',
  NaoLida = 'NaoLida'
}

export interface OpcaoFiltro {
  id: FiltroNovidade,
  icone: string,
  descricao: string,
  ativo?: boolean
}

export interface Novidade {
  id: string;
  titulo: string;
  mensagem: string;
  url?: string;
  dataInicial?: string,
  dataFinal?: string,
}

export interface NovidadeLeituraEvent {
  id: string;
  url?: string;
}
