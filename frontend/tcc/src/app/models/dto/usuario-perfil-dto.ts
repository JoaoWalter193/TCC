import { ProposicaoResumoDTO } from './proposicao-resumo-dto';

export interface UsuarioPerfilDTO {
  cpf: string;
  nome: string;
  email: string;
  cep: string | null;
  escolaridade: string | null;
  profissao: string | null;
  totalVereadoresSeguidos: number;
  proposicoesFavoritas: ProposicaoResumoDTO[];
}
