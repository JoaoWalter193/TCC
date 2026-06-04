import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardDataDTO } from '../models/dto/dashboard-data-dto';
import { DashboardMetadata } from '../models/dto/dashboard-metadata';
import { DashboardChartConfig, ChartPreviewResponse } from '../models/dto/dashboard-chart-config';
import { ApiGatewayService } from './api-gateway.service';

@Injectable({ providedIn: 'root' })
export class Dashboard {
  constructor(private api: ApiGatewayService) {}

  getDashboardDefault(): Observable<DashboardDataDTO> {
    return this.api.bi.get<DashboardDataDTO>('/dashboard/default');
  }

  getMetadata(): Observable<DashboardMetadata> {
    return this.api.bi.get<DashboardMetadata>('/metadata');
  }

  previewChart(config: DashboardChartConfig): Observable<ChartPreviewResponse> {
    return this.api.bi.post<ChartPreviewResponse>('/dashboard/preview', config);
  }

  getDashboardData(dashboardId: number): Observable<ChartPreviewResponse> {
    return this.api.bi.get<ChartPreviewResponse>(`/dashboard/${dashboardId}/data`);
  }
}
