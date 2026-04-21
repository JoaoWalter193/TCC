import { Component, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import {
  AllCommunityModule,
  ModuleRegistry as GridModuleRegistry,
  ColDef,
} from 'ag-grid-community';
import {
  ModuleRegistry as ChartsModuleRegistry,
  AllCommunityModule as ChartsAllCommunityModule,
} from 'ag-charts-community';
import { AgChartsModule } from 'ag-charts-angular';
import { AgGridModule } from 'ag-grid-angular';
import { Dashboard } from 'src/app/services/dashboard';

GridModuleRegistry.registerModules([AllCommunityModule]);

ChartsModuleRegistry.registerModules([ChartsAllCommunityModule]);

@Component({
  selector: 'app-dashboard-view',
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.scss'],
  imports: [IonContent, CommonModule, AgGridModule, AgChartsModule],
})
export class DashboardViewComponent implements OnInit {
  columnDefs: ColDef[] = [];
  rowData: any[] = [];
  chartOptions: any = { data: [], series: [] };

  constructor(private dashboardService: Dashboard) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.dashboardService.getDashboardDefault().subscribe({
      next: (data) => {
        this.columnDefs = data.columnDefs;
        this.rowData = data.rowData;
        this.initChart();
      },
      error: (err) => console.error('Erro ao carregar dashboard:', err),
    });
  }

  get chartData() {
    return this.rowData.map((item) => ({
      name: item.vereador_nome,
      value: item.contagem,
    }));
  }

  initChart() {
    this.chartOptions = {
      data: this.chartData,
      series: [
        {
          type: 'pie',
          angleKey: 'value',
          calloutLabelKey: 'name',
          strokeWidth: 0,
        },
      ],
    };
  }
}
