export interface AlterarUsuarioDTO {
  nome: string;
  email: string;
  senhaAntiga?: string;
  senhaNova?: string;
  senhaNovaNovamente?: string;
  cep?: string | null;
  escolaridade?: string | null;
  profissao?: string | null;
  genero?: string;
  dataNascimento?: string;
}
