import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioDTO } from '../models/dto/usuario-dto';
import { UsuarioPerfilDTO } from '../models/dto/usuario-perfil-dto';
import { CriarUsuarioDTO } from '../models/dto/criar-usuario-dto';
import { AlterarUsuarioDTO } from '../models/dto/alterar-usuario-dto';
import { ResponseDTO, LoginResponseDTO } from '../models/dto/response-dto';
import { LoginRequest } from '../models/dto/login-request';
import { ApiGatewayService } from './api-gateway.service';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  constructor(private api: ApiGatewayService) {}

  pegarUsuario(cpf: string): Observable<UsuarioDTO> {
    return this.api.v1.get<UsuarioDTO>(`/user/${cpf}`);
  }

  pegarPerfil(cpf: string): Observable<UsuarioPerfilDTO> {
    return this.api.v1.get<UsuarioPerfilDTO>(`/user/${cpf}/perfil`);
  }

  criarUsuario(data: CriarUsuarioDTO): Observable<ResponseDTO> {
    return this.api.v1.post<ResponseDTO>('/user', data);
  }

  loginUsuario(data: LoginRequest): Observable<LoginResponseDTO> {
    return this.api.v1.post<LoginResponseDTO>('/user/login', data);
  }

  atualizarUsuario(cpf: string, data: AlterarUsuarioDTO): Observable<UsuarioDTO> {
    return this.api.v1.put<UsuarioDTO>(`/user/${cpf}`, data);
  }

  deletarUsuario(cpf: string): Observable<ResponseDTO> {
    return this.api.v1.delete<ResponseDTO>(`/user/${cpf}`);
  }

  recuperarContaSenha(email: string): Observable<ResponseDTO> {
    return this.api.v1.post<ResponseDTO>(`/user/recover/${email}`, {});
  }
}
