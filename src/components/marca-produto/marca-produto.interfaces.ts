export interface LinhaServico {
  abbreviation: string
}

export interface Produto {
  id: number,
  serviceLine: LinhaServico,
  name: string,
  url: string,
}
