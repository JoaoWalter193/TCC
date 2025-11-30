export interface AlterarUsuarioDTO {
  nome: string;
  email: string;
  senhaAntiga?: string;
  senhaNova?: string;
  senhaNovaNovamente?: string;
}
