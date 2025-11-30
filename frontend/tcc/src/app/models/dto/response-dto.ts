import { UsuarioDTO } from './usuario-dto';
export interface ResponseDTO {
  mensagem: string;
  token?: string;
  usuario?: UsuarioDTO;
}
