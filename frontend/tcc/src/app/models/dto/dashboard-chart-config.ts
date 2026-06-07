export interface DashboardChartConfig {
  title: string;
  chart_type: 'bar' | 'pie' | 'sunburst';
  operation: 'count' | 'sum' | 'mean';
  x_axis?: string;
  y_axis?: string;
  levels?: string[];
  metric?: string;
  filters?: { [column: string]: string[] };
}

export interface HierarchyNode {
  name: string;
  value?: number;
  children?: HierarchyNode[];
}

export interface ChartPreviewResponse {
  chart_data: {
    type: 'flat' | 'hierarchy';
    data?: { label: string; value: number }[];
    tree?: HierarchyNode[];
    flat?: Record<string, unknown>[];
    levels?: string[];
    value_col?: string;
    total?: number;
  };
  config: DashboardChartConfig;
}

export interface DashboardDataResponse {
  dashboard: {
    id: number;
    user_id: number;
    title: string;
    config: DashboardChartConfig;
  };
  chart_data: ChartPreviewResponse['chart_data'];
}
