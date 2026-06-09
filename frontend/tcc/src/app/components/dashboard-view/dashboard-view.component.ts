import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ColDef } from 'ag-grid-community';
import { AgChartsModule } from 'ag-charts-angular';
import { AgGridModule } from 'ag-grid-angular';
import { Dashboard } from 'src/app/services/dashboard';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-dashboard-view',
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.scss'],
  imports: [IonContent, IonButton, IonIcon, CommonModule, AgGridModule, AgChartsModule],
})
export class DashboardViewComponent implements OnInit {
  @ViewChild('dashboardContent', { read: ElementRef })
  dashboardContentRef!: ElementRef;

  columnDefs: ColDef[] = [];
  rowData: any[] = [];
  chartOptions: any = { data: [], series: [] };
  showChart = false;

  constructor(
    private dashboardService: Dashboard,
    private shareService: ShareService,
  ) {}

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
    this.showChart = this.chartData.length > 0;
    if (!this.showChart) return;

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

  async compartilharDashboard() {
    const el = this.dashboardContentRef.nativeElement;
    await this.shareService.compartilharGrafico(el, 'Dashboard CuritibAtiva');
  }
}
