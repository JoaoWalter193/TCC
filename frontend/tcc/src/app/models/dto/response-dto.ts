import { UsuarioDTO } from './usuario-dto';

export interface ResponseDTO {
  cod: string;
  desc: string;
}

export interface LoginResponseDTO {
  usuario: UsuarioDTO;
  token: string;
}
