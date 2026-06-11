import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiGatewayService } from './api-gateway.service';
import { ProposicaoListaDTO, ProposicaoDTO } from '../models/dto/proposicao-dto';
import { mapListaToListaDTO } from './proposicao';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private api = inject(ApiGatewayService);

  listar(usuarioId: number): Observable<ProposicaoDTO[]> {
    return this.api.v1.get<ProposicaoListaDTO[]>(`/user/${usuarioId}/fav`).pipe(
      map(lista => lista.map(item => ({
        ...mapListaToListaDTO(item),
        isFavorito: true,
      }))),
    );
  }

  favoritar(usuarioId: number, codigo: number): Observable<void> {
    return this.api.v1.post(`/user/${usuarioId}/fav/${codigo}`, {}).pipe(map(() => void 0));
  }

  desfavoritar(usuarioId: number, codigo: number): Observable<void> {
    return this.api.v1.delete(`/user/${usuarioId}/fav/${codigo}`).pipe(map(() => void 0));
  }
}
