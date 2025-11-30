import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioDTO } from '../models/dto/usuario-dto';
import { CriarUsuarioDTO } from '../models/dto/criar-usuario-dto';
import { AlterarUsuarioDTO } from '../models/dto/alterar-usuario-dto';
import { ResponseDTO } from '../models/dto/response-dto';
import { LoginRequest } from '../models/dto/login-request';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8080/user';

  constructor(private http: HttpClient) {}

  pegarUsuario(cpf: string): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.apiUrl}/${cpf}`);
  }

  criarUsuario(data: CriarUsuarioDTO): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(this.apiUrl, data);
  }

  loginUsuario(data: LoginRequest): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(`${this.apiUrl}/login`, data);
  }

  atualizarUsuario(cpf: string, data: AlterarUsuarioDTO): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.apiUrl}/${cpf}`, data);
  }

  deletarUsuario(cpf: string): Observable<ResponseDTO> {
    return this.http.delete<ResponseDTO>(`${this.apiUrl}/${cpf}`);
  }

  recuperarContaSenha(email: string): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(`${this.apiUrl}/recover/${email}`, {});
  }
}
