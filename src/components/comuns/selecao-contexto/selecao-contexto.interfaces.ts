import { ItemContexto } from './contexto.interfaces';

export interface ItemSelecaoContexto extends ItemContexto {
  imagemAvatar?: string;
  complemento?: string;
  icone?: string;
  iconeStatus?: string;
  iconeStatusTitle?: string;
}
