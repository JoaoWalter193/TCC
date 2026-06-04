export interface ResponseDTO {
  cod: string;
  desc: string;
}

export interface LoginResponseDTO {
  usuario: {
    cpf: string;
    nome: string;
    email: string;
  };
  token: string;
}
