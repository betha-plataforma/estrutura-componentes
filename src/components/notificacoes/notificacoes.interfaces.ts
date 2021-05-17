import { ReadAction } from './notificacoes.constants';

export enum TipoNotificacao {
  Lida = 'Lida', NaoLida = 'NaoLida', Progresso = 'Progresso'
}

export interface NotificacaoLink {
  title: string;
  label?: string;
  target: string;
  href: string;
  autoOpen?: boolean;
}

export interface NotificacaoLeituraEvent {
  id: string;
  url?: string;
  target?: string;
}

export interface NotificacaoComLinkEvent {
  texto: string;
  link: NotificacaoLink;
}

// Esta interface representa a estrutura da notificação que vem da API
export interface Notificacao {
  id: string;
  systemId?: number;
  sequence: number;
  text: string;
  source: string;
  aggregationMessageId?: unknown;
  cancellationLink?: NotificacaoLink
  closed?: boolean;
  context?: unknown;
  contextDestined?: boolean;
  dateTime?: number;
  destination?: 'USER';
  icon?: string;
  identifier?: unknown
  link?: NotificacaoLink;
  percentage?: number;
  priority?: number;
  process?: boolean;
  progress?: boolean;
  read?: boolean;
  status?: string;
  trackingLink?: NotificacaoLink;
  type?: unknown;
  user?: string;
  userDestined?: boolean;
}

export interface NotificacaoWebsocketMessage {
  type: string;
  notifications?: any[];
  readAction?: {
    message: Notificacao,
    action: ReadAction
  };
  unread?: number;
  unreadInProgress?: number;
  sequence?: number;
}

export interface OpcaoFiltro {
  id: TipoNotificacao,
  ativo?: boolean,
  total?: number,
  icone: string,
  descricao: string,
}

export interface ItemNotificacaoProps {
  toggleRead?(): any,
  notificacao: any,
}
