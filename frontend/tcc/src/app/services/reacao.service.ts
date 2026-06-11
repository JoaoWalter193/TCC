import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiGatewayService } from './api-gateway.service';
import { ResponseDTO } from '../models/dto/response-dto';

@Injectable({ providedIn: 'root' })
export class ReacaoService {
  constructor(private api: ApiGatewayService) {}

  reagir(usuarioId: number, proposicaoCodigo: number, tipo: 'LIKE' | 'DISLIKE'): Observable<ResponseDTO> {
    return this.api.v1.post<ResponseDTO>(`/user/${usuarioId}/reacao/${proposicaoCodigo}?tipo=${tipo}`, null);
  }

}
