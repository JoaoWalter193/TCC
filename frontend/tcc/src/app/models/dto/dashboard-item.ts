import { DashboardChartConfig } from './dashboard-chart-config';

export interface DashboardItem {
  id: number;
  usuario_id: number;
  titulo: string;
  chart_type: string;
  config: DashboardChartConfig;
  created_at: string | null;
  updated_at: string | null;
}
