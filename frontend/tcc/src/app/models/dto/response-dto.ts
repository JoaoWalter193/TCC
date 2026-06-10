export interface ResponseDTO {
  cod: string;
  desc: string;
}

export interface LoginResponseDTO {
  usuario: {
    cpf: string;
    nome: string;
    email: string;
    cep: string | null;
    escolaridade: string | null;
    profissao: string | null;
  };
  token: string;
}
