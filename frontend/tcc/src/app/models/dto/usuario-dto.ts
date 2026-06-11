export interface UsuarioDTO {
  id: number;
  cpf: string;
  nome: string;
  email: string;
  cep: string | null;
  escolaridade: string | null;
  profissao: string | null;
}
