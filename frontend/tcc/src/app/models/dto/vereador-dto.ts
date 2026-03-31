import { ProposicaoDTO } from './proposicao-dto';

export interface VereadorDTO {
  id: number;
  nome: string;
  partido: string;
  legislaturas: string;
  gabinete: string;
  telefone: string;
  email: string;
  site: string;
  posts?: number[];
}
