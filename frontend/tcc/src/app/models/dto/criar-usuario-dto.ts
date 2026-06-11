export interface CriarUsuarioDTO {
  cpf: string;
  nome: string;
  email: string;
  senha: string;
  senhaNovamente: string;
  cep?: string;
  escolaridade?: string;
  profissao?: string;
}
