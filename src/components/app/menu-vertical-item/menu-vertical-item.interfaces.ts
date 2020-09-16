import { IdentificadorOpcaoMenu } from '../app.interfaces';

export interface MenuVerticalSelecionadoEvent {
  identificador: IdentificadorOpcaoMenu;
  identificadorPai?: IdentificadorOpcaoMenu;
}
