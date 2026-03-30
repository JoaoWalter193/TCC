import { ProposicaoDTO } from './proposicao-dto';
import { VereadorDTO } from './vereador-dto';

export type VisitadosDTO =
  | {
      id: number;
      tipo: 'proposicao';
      component: ProposicaoDTO;
    }
  | {
      id: number;
      tipo: 'vereador';
      component: VereadorDTO;
    };