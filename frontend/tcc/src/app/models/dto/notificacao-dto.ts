export interface NotificacaoDTO {
  id: number;
  usuarioId: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadaEm: string;
  proposicaoCodigo: number | null;
}

export type NotificacaoTipo = 'proposicao' | 'vereador';

export interface NotificacaoViewModel extends NotificacaoDTO {
  tipo: NotificacaoTipo;
  vereadorNome?: string;
  proposicaoTitulo?: string;
  proposicaoTag?: string;
  tempoRelativo: string;
}
