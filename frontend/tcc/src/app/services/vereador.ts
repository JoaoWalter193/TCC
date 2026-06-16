import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { VereadorDTO } from '../models/dto/vereador-dto';
import { ApiGatewayService } from './api-gateway.service';

interface VereadorBackend {
  id: number;
  nome: string;
  partido: string;
  email: string;
  legislaturas: string;
  gabinete: string;
  telefone: string;
  site: string;
  vereador_ativo: string;
  genero: string;
  dataNasc: string;
  vereador_cor: string;
  ocupacao: string;
  vereador_escolaridade: string;
  seguidores?: number;
}

function mapToDTO(v: VereadorBackend): VereadorDTO {
  return {
    id: v.id,
    nome: v.nome,
    partido: v.partido ?? '',
    legislaturas: v.legislaturas ?? '',
    gabinete: v.gabinete ?? '',
    telefone: v.telefone ?? '',
    email: v.email ?? '',
    site: v.site ?? '',
    seguidores: v.seguidores ?? 0,
  };
}

@Injectable({ providedIn: 'root' })
export class VereadorService {
  constructor(private api: ApiGatewayService) {}

  listarTopSeguidos(): Observable<VereadorDTO[]> {
    return this.api.v1.get<VereadorBackend[]>('/vereador/top-seguidos')
      .pipe(map(lista => lista.map(mapToDTO)));
  }

  listar(): Observable<VereadorDTO[]> {
    return this.api.v1.get<VereadorBackend[]>('/vereador')
      .pipe(map(lista => lista.map(mapToDTO)));
  }

  buscarPorId(id: number): Observable<VereadorDTO | undefined> {
    return this.api.v1.get<VereadorBackend>(`/vereador/${id}`)
      .pipe(map(v => mapToDTO(v)));
  }

  listarSeguindo(usuarioId: number): Observable<VereadorDTO[]> {
    return this.api.v1.get<VereadorBackend[]>(`/user/${usuarioId}/follow`)
      .pipe(map(lista => lista.map(mapToDTO)));
  }

  verificarStatusSeguindo(usuarioId: number, vereadorId: number): Observable<boolean> {
    return this.api.v1.get<boolean>(`/user/${usuarioId}/follow/${vereadorId}/status`);
  }

  seguir(usuarioId: number, vereadorId: number): Observable<unknown> {
    return this.api.v1.post(`/user/${usuarioId}/follow/${vereadorId}`, {});
  }

  deixarDeSeguir(usuarioId: number, vereadorId: number): Observable<unknown> {
    return this.api.v1.delete(`/user/${usuarioId}/follow/${vereadorId}`);
  }
}
