export interface Banner {
  texto: string;
  tipo: 'info' | 'warning' | 'danger';
  link?: string;
  target?: '_blank' | '_parent' | '_self' | '_top';
  labelLink?: string;
  icone?: string;
  button?: ButtonBanner;
}

export interface ButtonBanner {
  textButton: string;
}

export interface MenuBannerAlteradoEvent {
  possui: boolean
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
  possuiBadgeIcone?: boolean;
  isAtivo?: boolean;
}

export interface OpcaoMenuInterna extends OpcaoMenu {
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
