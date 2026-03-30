import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { VereadorDTO } from '../models/dto/vereador-dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VereadorService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/vereadores.json`;

  listar(): Observable<VereadorDTO[]> {
    return this.http.get<VereadorDTO[]>(this.api);
  }

  buscarPorId(id: number): Observable<VereadorDTO | undefined> {
    return this.http
      .get<VereadorDTO[]>(this.api)
      .pipe(map((lista) => lista.find((v) => v.id === id)));
  }
}
