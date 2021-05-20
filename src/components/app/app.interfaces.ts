export interface Banner {
  texto: string;
  tipo: 'info' | 'warning';
  link?: string;
}

export interface MenuBannerAlteradoEvent {
  possui: boolean
}

export interface BannerAtualizadoEvent{
  banner: Banner;
}

export interface ConteudoSinalizadoEvent {
  possui: boolean;
  origem: string;
}

export type IdentificadorOpcaoMenu = string | number;

export interface OpcaoMenu {
  id: IdentificadorOpcaoMenu;
  descricao: string;
  rota?: string;
  contador?: number;
  icone?: string;
  submenus?: Array<OpcaoMenu>;
  possuiPermissao?: boolean;
}

export interface OpcaoMenuInterna extends OpcaoMenu {
  isAtivo?: boolean;
  isRecolhido?: boolean;
  submenus?: Array<OpcaoMenuInterna>
}

export interface OpcaoMenuSelecionadaEvent {
  id: IdentificadorOpcaoMenu,
  descricao: string,
  rota: unknown,
  contador: number
}

export interface LocalStorageState {
  flutuando: boolean,
  aberto: boolean
}
