const CONFIG_SISTEMAS = {
  // Gestão Municipal
  mun: { title: 'Gestão Municipal', iconClass: 'bell' },
  custos: { title: 'Custos', iconClass: 'chart-bar' },

  // Planejamento e Contabilidade
  pla: { title: 'Planejamento e Contabilidade', iconClass: 'bell' },
  contabil: { title: 'Contabil', iconClass: 'calculator' },
  planejamento: { title: 'Planejamento', iconClass: 'calendar-check' },
  tesouraria: { title: 'Tesouraria', iconClass: 'cloud' },

  // Arrecadação e Fiscalização
  arr: { title: 'Arrecadação e Fiscalização', iconClass: 'bell' },
  livro: { title: 'Livro Eletrônico', iconClass: 'cloud' },
  tributos: { title: 'Tributos', iconClass: 'currency-usd' },
  procuradoria: { title: 'Procuradoria', iconClass: 'scale-balance' },

  // Atendimento
  ate: { title: 'Atendimento', iconClass: 'bell' },

  // Gestão de Compras e Contratos
  com: { title: 'Gestão de Compras e Contratos', iconClass: 'bell' },
  compras: { title: 'Compras', iconClass: 'cart' },
  estoque: { title: 'Estoque', iconClass: 'cube' },
  frotas: { title: 'Frotas', iconClass: 'truck' },

  // Pessoal e recursos Humanos
  pes: { title: 'Pessoal e Recursos Humanos', iconClass: 'bell' },
  folha: { title: 'Folha', iconClass: 'file-document-outline' },
  ponto: { title: 'Ponto', iconClass: 'fax' },

  // Saúde e Assistência Social
  sau: { title: 'Saúde e Assistência Social', iconClass: 'heart-pulse' },

  // Educação e Gestão Escolar
  edu: { title: 'Educação e Gestão Escolar', iconClass: 'bell' },
  educacao: { title: 'Educação', iconClass: 'school' },
  escola: { title: 'Escola', iconClass: 'human-handsup' },

  // Gestão de Leis Municipais
  lei: { title: 'Lei', iconClass: 'bell' },

  // Suporte
  sup: { title: 'Suporte', iconClass: 'bell' },

  // Performance Corporativa
  acionadores: { title: 'Acionadores', iconClass: 'shuffle-variant' },
  atendimento: { title: 'Atendimento', iconClass: 'lifebuoy' },
  crm: { title: 'CRM', iconClass: 'briefcase' },
  paineis: { title: 'Painéis', iconClass: 'chart-pie' },
  'planejamento-estrategico': { title: 'Planejamento Estratégico', iconClass: 'chart-bar' },
  rh: { title: 'RH', iconClass: 'account-group' },
  tarefas: { title: 'Tarefas', iconClass: 'checkbox-marked-outline' },

  // Componentes Genéricos
  gen: { title: 'Componentes Genéricos', iconClass: 'bell' },
  processo: { title: 'Processo', iconClass: 'cogs' },
  script: { title: 'Script', iconClass: 'code-tags' },
  relatorio: { title: 'Relatório', iconClass: 'file-multiple-outline' }
};

export function getIcone(sistema: string): string {
  return CONFIG_SISTEMAS[sistema] && CONFIG_SISTEMAS[sistema].iconClass ? CONFIG_SISTEMAS[sistema].iconClass : CONFIG_SISTEMAS.gen.iconClass;
}

export function getIconeTitle(sistema: string): string {
  return CONFIG_SISTEMAS[sistema] && CONFIG_SISTEMAS[sistema].title;
}
