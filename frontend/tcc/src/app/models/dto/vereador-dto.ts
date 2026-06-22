export interface VereadorDTO {
  id: number;
  nome: string;
  partido: string;
  legislaturas: string;
  gabinete: string;
  telefone: string;
  email: string;
  site: string;
  genero: string;
  vereador_ativo: string;
  dataNasc: string;
  vereador_cor: string;
  ocupacao: string;
  vereador_escolaridade: string;
  avatarUrl: string;
  seguidores?: number;
}
