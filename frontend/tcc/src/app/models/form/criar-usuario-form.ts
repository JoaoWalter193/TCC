import { CriarUsuarioDTO } from '../dto/criar-usuario-dto';

export interface CriarUsuarioForm extends CriarUsuarioDTO {
  senhaNovamente: string;
}
