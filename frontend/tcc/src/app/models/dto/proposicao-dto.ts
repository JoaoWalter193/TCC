export interface ProposicaoListaDTO {
  codigo: number;
  tipo: string;
  vereadorId: number;
  vereadorNome: string;
  dataEnvio: string;
  razao: string;
  ementa: string;
  tag: string;
  estado: string;
  likes: number;
  dislikes: number;
  currentUserReaction: string | null;
}

export interface ProposicaoDetalheDTO {
  codigo: number;
  tipoNome: string;
  vereadorId: number;
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
  likes: number;
  dislikes: number;
  currentUserReaction: string | null;
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
  currentUserReaction: string | null;
  isFavorito: boolean;
}
