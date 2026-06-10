import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardDataDTO } from '../models/dto/dashboard-data-dto';
import { DashboardMetadata } from '../models/dto/dashboard-metadata';
import {
  DashboardChartConfig,
  ChartPreviewResponse,
} from '../models/dto/dashboard-chart-config';
import { DashboardItem } from '../models/dto/dashboard-item';
import { ApiGatewayService } from './api-gateway.service';

@Injectable({ providedIn: 'root' })
export class Dashboard {
  constructor(private api: ApiGatewayService) {}

  // ── Default / Ranking ──────────────────────────────────────────────

  getDashboardDefault(): Observable<DashboardDataDTO> {
    return this.api.bi.get<DashboardDataDTO>('/dashboard/default');
  }

  getMetadata(): Observable<DashboardMetadata> {
    return this.api.bi.get<DashboardMetadata>('/metadata');
  }

  previewChart(
    config: DashboardChartConfig,
  ): Observable<ChartPreviewResponse> {
    return this.api.bi.post<ChartPreviewResponse>(
      '/dashboard/preview',
      config,
    );
  }

  getDashboardData(dashboardId: number): Observable<ChartPreviewResponse> {
    return this.api.bi.get<ChartPreviewResponse>(
      `/dashboard/${dashboardId}/data`,
    );
  }

  // ── CRUD Meus Dashboards ───────────────────────────────────────────

  listarDashboards(userId: number): Observable<DashboardItem[]> {
    return this.api.bi.get<DashboardItem[]>(
      `/dashboards?user_id=${userId}`,
    );
  }

  buscarDashboard(id: number): Observable<DashboardItem> {
    return this.api.bi.get<DashboardItem>(`/dashboards/${id}`);
  }

  criarDashboard(payload: {
    usuario_id: number;
    titulo: string;
    chart_type: string;
    config: DashboardChartConfig;
  }): Observable<DashboardItem> {
    return this.api.bi.post<DashboardItem>('/dashboards', payload);
  }

  atualizarDashboard(
    id: number,
    payload: {
      titulo: string;
      chart_type: string;
      config: DashboardChartConfig;
    },
  ): Observable<DashboardItem> {
    return this.api.bi.put<DashboardItem>(`/dashboards/${id}`, payload);
  }

  excluirDashboard(id: number): Observable<{ ok: boolean }> {
    return this.api.bi.delete<{ ok: boolean }>(`/dashboards/${id}`);
  }
}
