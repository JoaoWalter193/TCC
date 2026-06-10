import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiGatewayService } from './api-gateway.service';

export interface ResumoRequest {
  codigo: number;
  tipo: string;
  vereador: string;
  ementa: string;
  texto: string;
  justificativa: string;
  estado: string;
  tag: string;
}

@Injectable({ providedIn: 'root' })
export class IaService {
  private api = inject(ApiGatewayService);

  gerarResumo(data: ResumoRequest): Observable<{ resumo: string }> {
    return this.api.bi.post<{ resumo: string }>('/resumo', data);
  }
}
