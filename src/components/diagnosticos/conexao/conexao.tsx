import { Component, Event, EventEmitter, h, Listen, State } from '@stencil/core';
import { ConteudoSinalizadoEvent, BannerAtualizadoEvent, Banner } from '../../app/app.interfaces';
import IlustracaoConexaoOffline from './ilustracao-conexao-offline';


@Component({
  tag: 'bth-conexao',
  styleUrl: 'conexao.scss',
  shadow: true,
})
export class Conexao {  
    
  @Listen('online', {target: 'window'})
  onWindowOnline() {    
    this.onLine = true; 
    this.atualizarIndicadorConteudoSinalizado();  
    this.apresentaBannerAlerta(); 
  }  
  
  
  @Listen('offline', {target: 'window'})
  onWindowOffline() {    
    this.onLine = false; 
    this.atualizarIndicadorConteudoSinalizado();
    this.apresentaBannerAlerta();
  }    
  
  /**
   * É emitido quando houver alteracões na conexão com a internet
   */
  @Event() conteudoSinalizado: EventEmitter<ConteudoSinalizadoEvent>;

  /**
   * É emitido quando houver alteracões na conexão com a internet
   */
  @Event() bannerAtualizado: EventEmitter<BannerAtualizadoEvent>;
  
  @State() onLine: boolean = window.navigator.onLine;    

  private atualizarIndicadorConteudoSinalizado() {
    const event: ConteudoSinalizadoEvent = {
      possui: !this.onLine,
      origem: 'conexao'
    };
    
    this.conteudoSinalizado.emit(event);
  }
  
  private apresentaBannerAlerta() {
    const banner: Banner = {
      texto: 'Sem conexão com a Internet.',
      tipo: 'warning'
    };
    

    const event: BannerAtualizadoEvent = {
      banner: this.onLine? undefined: banner
    };

    this.bannerAtualizado.emit(event);
  }


  
  render() {        
    if (this.onLine) {
      return undefined;
    }

    return (              
      <bth-menu-ferramenta descricao="Conexão" tituloPainelLateral="Conexão">        

        <div class="desktop" slot="menu_item_desktop">
          <bth-icone icone="wifi" tamanho="18px"></bth-icone>          
          <span class="badge">!</span>
        </div>
              
        <div class="mobile" slot="menu_item_mobile">
          <bth-icone icone="wifi" tamanho="18px"></bth-icone>          
          <span class="badge">!</span>
        </div>
        <span slot="menu_descricao_mobile" class="descricao-mobile">Conexão</span>        
        <div slot="conteudo_painel_lateral" class="empty-conexao">                      
          <div>            
            <IlustracaoConexaoOffline />
            <h4>
              Sem conexão com a internet
            </h4>
            <span>Verifique os cabos de rede, modem e roteador</span>
          </div>                    
        </div>
      </bth-menu-ferramenta>            
    );
  }
}
