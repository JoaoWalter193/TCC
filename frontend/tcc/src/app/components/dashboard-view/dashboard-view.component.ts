import { Component, OnInit, ViewChild, ElementRef, inject, effect } from '@angular/core';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ColDef, themeAlpine } from 'ag-grid-community';
import { AgChartsModule } from 'ag-charts-angular';
import { AgGridModule } from 'ag-grid-angular';
import { Dashboard } from 'src/app/services/dashboard';
import { ShareService } from 'src/app/services/share.service';
import { ThemeService } from 'src/app/services/theme.service';

const alpineDark = themeAlpine.withParams({
  backgroundColor: '#181d1f',
  foregroundColor: '#ffffff',
  borderColor: '#68686e',
  chromeBackgroundColor: '#181d1f',
  accentColor: '#2196f3',
  selectedRowBackgroundColor: 'rgba(33, 150, 243, 0.3)',
  rowHoverColor: 'rgba(33, 150, 243, 0.1)',
  columnHoverColor: 'rgba(33, 150, 243, 0.1)',
  modalOverlayBackgroundColor: 'rgba(24, 29, 31, 0.66)',
  browserColorScheme: 'dark',
});

@Component({
  selector: 'app-dashboard-view',
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.scss'],
  imports: [IonContent, IonButton, IonIcon, CommonModule, AgGridModule, AgChartsModule],
})
export class DashboardViewComponent implements OnInit {
  @ViewChild('captureArea', { read: ElementRef })
  captureAreaRef!: ElementRef;

  private themeService = inject(ThemeService);

  columnDefs: ColDef[] = [];
  rowData: any[] = [];
  chartOptions: any = { data: [], series: [] };
  showChart = false;
  gridTheme = themeAlpine;

  constructor(
    private dashboardService: Dashboard,
    private shareService: ShareService,
  ) {
    effect(() => {
      const isDark = this.themeService.isDarkMode();
      this.gridTheme = isDark ? alpineDark : themeAlpine;
      if (this.showChart) {
        this.chartOptions = { ...this.chartOptions, theme: isDark ? 'ag-default-dark' : 'ag-default' };
      }
    });
  }

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
      theme: this.themeService.isDarkMode() ? 'ag-default-dark' : 'ag-default',
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
    const el = this.captureAreaRef.nativeElement;
    await this.shareService.compartilharGrafico(el, 'Dashboard CuritibAtiva');
  }
}
