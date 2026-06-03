import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardDataDTO } from '../models/dto/dashboard-data-dto';
import { DashboardMetadata } from '../models/dto/dashboard-metadata';
import { DashboardChartConfig, ChartPreviewResponse } from '../models/dto/dashboard-chart-config';

@Injectable({ providedIn: 'root' })
export class Dashboard {
  private apiUrl = 'http://localhost:8085';

  constructor(private http: HttpClient) {}

  getDashboardDefault(): Observable<DashboardDataDTO> {
    return this.http.get<DashboardDataDTO>(`${this.apiUrl}/dashboard/default`);
  }

  getMetadata(): Observable<DashboardMetadata> {
    return this.http.get<DashboardMetadata>(`${this.apiUrl}/metadata`);
  }

  previewChart(config: DashboardChartConfig): Observable<ChartPreviewResponse> {
    return this.http.post<ChartPreviewResponse>(`${this.apiUrl}/dashboard/preview`, config);
  }

  getDashboardData(dashboardId: number): Observable<ChartPreviewResponse> {
    return this.http.get<ChartPreviewResponse>(`${this.apiUrl}/dashboard/${dashboardId}/data`);
  }
}
