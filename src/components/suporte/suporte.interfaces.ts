export interface BlipChatUserInfo {
  id: string;
  nome: string;
  email: string;
}

export interface SuporteHorario {
  start: string;
  end: string;
}

export interface WebChatConfig {
  habilitado: boolean;
  horarioManha: SuporteHorario;
  horarioTarde: SuporteHorario;
  portfolio: string | null;
}
