import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { DashboardDataDTO } from '../models/dto/dashboard-data-dto';

@Injectable({
  providedIn: 'root',
})
export class Dashboard {
  //private apiUrl = `${environment.apiUrl}/dashboard`;
  private apiUrl = 'http://localhost:8085/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardDefault(): Observable<DashboardDataDTO> {
    return this.http.get<DashboardDataDTO>(`${this.apiUrl}/default`);
  }

  montarTabelaDinamica(tipo: string, campos: {name: string, role: string}[], dados: any) {
    
  }
}
