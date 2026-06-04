import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { VereadorDTO } from '../models/dto/vereador-dto';
import { ApiGatewayService } from './api-gateway.service';

interface VereadorBackend {
  id: number;
  nome: string;
  partido: { id: number; nomePartido: string };
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
}

function mapToDTO(v: VereadorBackend): VereadorDTO {
  return {
    id: v.id,
    nome: v.nome,
    partido: v.partido?.nomePartido ?? '',
    legislaturas: v.legislaturas ?? '',
    gabinete: v.gabinete ?? '',
    telefone: v.telefone ?? '',
    email: v.email ?? '',
    site: v.site ?? '',
  };
}

@Injectable({ providedIn: 'root' })
export class VereadorService {
  constructor(private api: ApiGatewayService) {}

  listar(): Observable<VereadorDTO[]> {
    return this.api.v1.get<VereadorBackend[]>('/vereador')
      .pipe(map(lista => lista.map(mapToDTO)));
  }

  buscarPorId(id: number): Observable<VereadorDTO | undefined> {
    return this.api.v1.get<VereadorBackend>(`/vereador/${id}`)
      .pipe(map(v => mapToDTO(v)));
  }
}
