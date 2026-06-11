import { ProposicaoDTO } from './dto/proposicao-dto';
import { VereadorDTO } from './dto/vereador-dto';

export interface ProposicaoListaResponseDTO {
  codigo: number;
  tipo: string;
  vereadorId: number;
  vereadorNome: string;
  dataEnvio: string;
  ementa: string;
  tag: string;
  estado: string;
  likes: number;
  dislikes: number;
  currentUserReaction: string | null;
}

export interface HistoricoResponseDTO {
  id: number;
  tipo: 'PROPOSICAO' | 'VEREADOR';
  dataAcesso: string;
  proposicao: ProposicaoListaResponseDTO | null;
  vereador: VereadorDTO | null;
}

export type HistoricoItem =
  | {
      id: number;
      tipo: 'PROPOSICAO';
      dataAcesso: string;
      componente: ProposicaoDTO;
    }
  | {
      id: number;
      tipo: 'VEREADOR';
      dataAcesso: string;
      componente: VereadorDTO;
    };
