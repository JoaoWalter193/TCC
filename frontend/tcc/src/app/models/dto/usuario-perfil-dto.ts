import { ProposicaoResumoDTO } from './proposicao-resumo-dto';

export interface UsuarioPerfilDTO {
  id: number;
  cpf: string;
  nome: string;
  email: string;
  cep: string | null;
  escolaridade: string | null;
  profissao: string | null;
  genero: string | null;
  dataNascimento: string | null;
  totalVereadoresSeguidos: number;
  proposicoesFavoritas: ProposicaoResumoDTO[];
}
