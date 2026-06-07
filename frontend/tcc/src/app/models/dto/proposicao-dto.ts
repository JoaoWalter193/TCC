export interface ProposicaoListaDTO {
  codigo: number;
  tipo: string;
  vereadorNome: string;
  dataEnvio: string;
  ementa: string;
  tag: string;
  estado: string;
}

export interface ProposicaoDetalheDTO {
  codigo: number;
  tipoNome: string;
  vereadorNome: string;
  vereadorPartido: string;
  dataEnvio: string;
  dataEfetivo: string;
  estadoNome: string;
  localizacao: string;
  ultimoTramite: string;
  razao: string;
  tramiteAlternativo: boolean;
  encerrouTramitacao: boolean;
  leisSimilares: string;
  ementa: string;
  texto: string;
  justificativa: string;
  tag: string;
}

export interface ProposicaoDTO {
  id: number;
  tipoProposicao: string;
  dataDeEnvio: string;
  dataEfetivo: string;
  localizacao: string;
  ultimoTramite: string;
  razao: string;
  tag: string;
  tramiteAlternativo: boolean;
  encerrouTramitacao: boolean;
  leisSimilares: string[];
  ementa: string;
  texto: string;
  justificativa: string;
  vereador: {
    id: number;
    nome: string;
    partido: string;
  };
  likes: number;
  dislikes: number;
}
