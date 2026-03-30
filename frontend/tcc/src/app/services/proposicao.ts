import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ProposicaoDTO } from '../models/dto/proposicao-dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProposicaoService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/proposicoes.json`;

  listar(): Observable<ProposicaoDTO[]> {
    return this.http.get<ProposicaoDTO[]>(this.api);
  }

  buscarPorId(id: number): Observable<ProposicaoDTO | undefined> {
    return this.http
      .get<ProposicaoDTO[]>(this.api)
      .pipe(map((lista) => lista.find((p) => p.id === id)));
  }
}
