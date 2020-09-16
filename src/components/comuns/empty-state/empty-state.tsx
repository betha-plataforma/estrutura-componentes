import { Component, Host, Prop, h, ComponentInterface } from '@stencil/core';

@Component({
  tag: 'bth-empty-state',
  styleUrl: 'empty-state.scss',
  shadow: true
})
export class EmptyState implements ComponentInterface {

  /**
   * Define se o empty state está visível
   */
  @Prop() readonly show: boolean = false;

  /**
   * Define se o empty state é para registros
   */
  @Prop() readonly registros: boolean = false;

  /**
   * Define se o empty state é para registros com pesquisa
   */
  @Prop() readonly registrosPesquisa: boolean = false;

  /**
  * Define se o empty state é para conexão online
  */
  @Prop() readonly online: boolean = false;

  /**
  * Define se o empty state é para conexão offline
  */
  @Prop() readonly offline: boolean = false;

  /**
  * Define se o empty state é para página não encontrada
  */
  @Prop() readonly paginaNaoEncontrada: boolean = false;

  /**
  * Define se o empty state é de tamanho pequeno
  */
  @Prop() readonly pequeno: boolean = false;

  render() {
    return (
      <Host>
        <section class={`empty-state ${this.pequeno ? 'empty-state--small' : ''} ${this.show ? 'empty-state--show' : ''}`}>
          <slot>
            {this.registros && ([
              <img
                src="https://cdn.betha.cloud/plataforma/design/kare/framework/0.1.6/assets/images/records.svg"
                alt="Ainda não há registros por aqui" />,
              <h4>Ainda não há registros por aqui</h4>,
            ])}

            {this.registrosPesquisa && ([
              <img
                src="https://cdn.betha.cloud/plataforma/design/kare/framework/0.1.6/assets/images/list.svg"
                alt="Nenhum resultado encontrado. Os filtros ou a ortografia dos termos utilizados na pesquisa podem ser revisados." />,
              <h4>Nenhum resultado encontrado para sua pesquisa</h4>,
              <p>
                - Tente utilizar uma combinação diferente de filtros<br />
                - Revise a ortografia dos termos digitados
              </p>,
            ])}

            {this.online && ([
              <img
                src="https://cdn.betha.cloud/plataforma/design/kare/framework/0.1.6/assets/images/online.svg"
                alt="Conexão com a Internet estável" />,
              <h4>Sua conexão está estável</h4>,
            ])}

            {this.offline && ([
              <img
                src="https://cdn.betha.cloud/plataforma/design/kare/framework/0.1.6/assets/images/offline.svg"
                alt="Desconectado da Internet" />,
              <h4>Você está offline</h4>,
              <p>Isso pode prejudicar as suas atividades no sistema</p>
            ])}

            {this.paginaNaoEncontrada && ([
              <img
                src="https://cdn.betha.cloud/plataforma/design/kare/framework/0.1.6/assets/images/404.svg"
                alt="Página não encontrada" />,
              <h4>Ops! Ocorreu um erro</h4>,
              <p>A página que você tentou acessar não foi encontrada</p>
            ])}
          </slot>
        </section>
      </Host>
    );
  }

}
