import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonButton, IonList, IonItem,
  IonSelect, IonSelectOption, IonLabel, IonCheckbox,
  IonSegment, IonSegmentButton, IonChip, IonText, IonInput,
  AlertController,
} from "@ionic/angular/standalone";
import { AgChartsModule } from 'ag-charts-angular';

import { AuthService } from 'src/app/services/auth.service';
import { Dashboard } from 'src/app/services/dashboard';
import { DashboardItem } from 'src/app/models/dto/dashboard-item';
import { DashboardMetadata } from 'src/app/models/dto/dashboard-metadata';
import { DashboardChartConfig } from 'src/app/models/dto/dashboard-chart-config';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-my-dashboard-view',
  templateUrl: './my-dashboard-view.component.html',
  styleUrls: ['./my-dashboard-view.component.scss'],
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon, IonButton, IonList, IonItem,
    IonSelect, IonSelectOption, IonLabel, IonCheckbox,
    IonSegment, IonSegmentButton, IonChip, IonText, IonInput,
    AgChartsModule,
  ],
  providers: [DatePipe],
})
export class MyDashboardViewComponent implements OnInit {
  @ViewChild('captureArea', { read: ElementRef })
  captureAreaRef!: ElementRef;

  auth = inject(AuthService);
  dashboard = inject(Dashboard);
  datePipe = inject(DatePipe);
  shareService = inject(ShareService);

  // ── Modo ──
  modo: 'list' | 'editor' = 'list';

  // ── Lista ──
  dashboards: DashboardItem[] = [];
  carregandoLista = false;

  // ── Editor ──
  dashboardEditId: number | null = null;
  tituloPersonalizado = '';
  metadata: DashboardMetadata = {};
  categoricalFields: string[] = [];
  numericFields: string[] = [];

  chartType: 'bar' | 'pie' | 'sunburst' = 'bar';
  selectedLevels: string[] = [];
  selectedMetric = 'codigo';
  selectedOperation: 'count' | 'sum' | 'mean' = 'count';
  filters: { column: string; values: string[] }[] = [];

  previewResult: any = null;
  chartOptions: any = null;
  loading = false;
  error = '';
  salvando = false;

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
  ) {}

  ngOnInit() {
    this.carregarLista();
  }

  // ═════════════════════════════════════════════════════════════════════
  //  LISTA
  // ═════════════════════════════════════════════════════════════════════

  private getUsuarioId(): number {
    const raw = localStorage.getItem('usuario_id');
    return raw ? Number(raw) : 0;
  }

  carregarLista() {
    const uid = this.getUsuarioId();
    if (!uid) {
      this.dashboards = [];
      return;
    }
    this.carregandoLista = true;
    this.dashboard.listarDashboards(uid).subscribe({
      next: (lista) => {
        this.dashboards = lista;
        this.carregandoLista = false;
      },
      error: () => {
        this.carregandoLista = false;
      },
    });
  }

  entrarModoCriacao() {
    this.dashboardEditId = null;
    this.resetarEditor();
    this.loadMetadata();
    this.modo = 'editor';
  }

  entrarModoEdicao(item: DashboardItem) {
    this.dashboardEditId = item.id;
    this.carregarConfigNoEditor(item);
    this.modo = 'editor';
  }

  voltarParaLista() {
    this.modo = 'list';
    this.carregarLista();
  }

  chartTypeLabel(type: string): string {
    const map: Record<string, string> = {
      bar: 'Barras',
      pie: 'Pizza',
      sunburst: 'Sunburst',
    };
    return map[type] || type;
  }

  // ═════════════════════════════════════════════════════════════════════
  //  EDITOR
  // ═════════════════════════════════════════════════════════════════════

  private resetarEditor() {
    this.tituloPersonalizado = '';
    this.chartType = 'bar';
    this.selectedLevels = [];
    this.selectedMetric = 'codigo';
    this.selectedOperation = 'count';
    this.filters = [];
    this.previewResult = null;
    this.chartOptions = null;
    this.error = '';
    this.metadata = {};
  }

  private carregarConfigNoEditor(item: DashboardItem) {
    this.resetarEditor();
    this.loadMetadata();

    this.tituloPersonalizado = item.titulo;

    const cfg = item.config;
    this.chartType = cfg.chart_type || 'bar';
    this.selectedLevels = cfg.levels ? [...cfg.levels] : [];
    this.selectedMetric = cfg.metric || 'codigo';
    this.selectedOperation = cfg.operation || 'count';

    if (cfg.filters) {
      this.filters = Object.entries(cfg.filters).map(([column, values]) => ({
        column,
        values: [...values],
      }));
    }
  }

  private loadMetadata() {
    this.dashboard.getMetadata().subscribe({
      next: (meta) => {
        this.metadata = meta;
        this.categoricalFields = Object.entries(meta)
          .filter(([_, v]) => v.dtype === 'categorical')
          .map(([k, _]) => k);
        this.numericFields = Object.entries(meta)
          .filter(([_, v]) => v.dtype === 'numeric')
          .map(([k, _]) => k);
        if (this.numericFields.length) this.selectedMetric = this.numericFields[0];
      },
      error: () => this.error = 'Erro ao carregar metadados do banco.',
    });
  }

  fieldLabel(key: string): string {
    return this.metadata[key]?.label || key;
  }

  formatCellValue(key: string, value: any): string {
    if (value == null) return '-';
    const meta = this.metadata[key];
    if (meta?.dtype === 'date') {
      return this.datePipe.transform(value, 'dd/MM/yyyy HH:mm') || String(value);
    }
    return String(value);
  }

  private formatChartLabel(value: string): string {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
      return this.datePipe.transform(value, 'dd/MM/yyyy') || value;
    }
    return value;
  }

  toggleLevel(field: string) {
    const idx = this.selectedLevels.indexOf(field);
    if (idx >= 0) {
      this.selectedLevels.splice(idx, 1);
    } else {
      this.selectedLevels.push(field);
    }
  }

  levelIndex(field: string): number {
    return this.selectedLevels.indexOf(field) + 1;
  }

  isLevelSelected(field: string): boolean {
    return this.selectedLevels.includes(field);
  }

  addFilter() {
    const available = this.categoricalFields.filter(
      (f) => !this.filters.find((fl) => fl.column === f)
    );
    if (available.length) {
      this.filters.push({ column: available[0], values: [] });
    }
  }

  removeFilter(index: number) {
    this.filters.splice(index, 1);
  }

  getFilterOptions(column: string): string[] {
    return this.metadata[column]?.options || [];
  }

  onFilterColumnChange(index: number) {
    this.filters[index].values = [];
  }

  buildConfig(): DashboardChartConfig {
    const config: DashboardChartConfig = {
      title: 'Pré-visualização',
      chart_type: this.chartType,
      operation: this.selectedOperation,
    };

    if (this.selectedLevels.length > 0) {
      config.levels = [...this.selectedLevels];
    }

    if (this.selectedOperation !== 'count' && this.selectedMetric) {
      config.metric = this.selectedMetric;
    }

    const activeFilters: { [col: string]: string[] } = {};
    for (const f of this.filters) {
      if (f.values.length > 0) {
        activeFilters[f.column] = f.values;
      }
    }
    if (Object.keys(activeFilters).length) config.filters = activeFilters;

    return config;
  }

  preview() {
    if (this.selectedLevels.length === 0) return;

    this.loading = true;
    this.error = '';
    this.previewResult = null;
    this.chartOptions = null;

    const config = this.buildConfig();
    this.dashboard.previewChart(config).subscribe({
      next: (res) => {
        this.previewResult = res;
        this.buildChart(res);
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao processar pré-visualização.';
        this.loading = false;
      },
    });
  }

  private buildChart(res: any) {
    const data = res.chart_data;

    if (data.type === 'hierarchy' && data.tree) {
      if (this.chartType === 'sunburst') {
        this.chartOptions = {
          data: [{ name: 'root', children: data.tree }],
          series: [{
            type: 'sunburst',
            labelKey: 'name',
            sizeKey: 'value',
            childrenKey: 'children',
          }],
        };
        return;
      }

      const flat = data.flat.map((r: any) => ({
        label: data.levels.map((l: string) => r[l]).join(' / '),
        value: r[data.value_col],
      }));
      const titleText = data.levels.map((l: string) => this.fieldLabel(l)).join(' > ');

      if (this.chartType === 'pie') {
        this.chartOptions = {
          data: flat,
          series: [{
            type: 'pie',
            angleKey: 'value',
            calloutLabelKey: 'label',
            calloutLabel: {
              formatter: ({ value }: any) => this.formatChartLabel(String(value)),
            },
            strokeWidth: 0,
          }],
          title: { text: titleText },
        };
      } else {
        this.chartOptions = {
          data: flat,
          axes: [
            {
              type: 'category',
              position: 'bottom',
              labelKey: 'label',
              label: {
                formatter: ({ value }: any) => this.formatChartLabel(String(value)),
              },
            },
            { type: 'number', position: 'left', labelKey: 'value' },
          ],
          series: [{
            type: 'bar',
            xKey: 'label',
            yKey: 'value',
          }],
          title: { text: titleText },
        };
      }
      return;
    }

    if (data.type === 'flat' && data.data) {
      const flat = data.data;
      if (this.chartType === 'pie') {
        this.chartOptions = {
          data: flat,
          series: [{
            type: 'pie',
            angleKey: 'value',
            calloutLabelKey: 'label',
            calloutLabel: {
              formatter: ({ value }: any) => this.formatChartLabel(String(value)),
            },
            strokeWidth: 0,
          }],
        };
      } else {
        this.chartOptions = {
          data: flat,
          axes: [
            {
              type: 'category',
              position: 'bottom',
              labelKey: 'label',
              label: {
                formatter: ({ value }: any) => this.formatChartLabel(String(value)),
              },
            },
            { type: 'number', position: 'left', labelKey: 'value' },
          ],
          series: [{
            type: 'bar',
            xKey: 'label',
            yKey: 'value',
          }],
        };
      }
    }
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  async compartilharDashboard() {
    const el = this.captureAreaRef.nativeElement;
    await this.shareService.compartilharGrafico(el, 'Meu Dashboard CuritibAtiva');
  }

  // ═════════════════════════════════════════════════════════════════════
  //  SALVAR / EXCLUIR
  // ═════════════════════════════════════════════════════════════════════

  salvarVisualizacao() {
    if (this.selectedLevels.length === 0) return;

    const config = this.buildConfig();
    const uid = this.getUsuarioId();
    if (!uid) {
      this.error = 'Usuário não identificado. Faça login novamente.';
      return;
    }

    this.salvando = true;
    this.error = '';

    const tituloCustom = this.tituloPersonalizado.trim();
    const titulo = tituloCustom
      ? tituloCustom
      : config.levels
        ? config.levels.map((l) => this.fieldLabel(l)).join(' > ')
        : 'Meu Dashboard';

    if (this.dashboardEditId) {
      // Atualizar existente
      this.dashboard
        .atualizarDashboard(this.dashboardEditId, {
          titulo,
          chart_type: this.chartType,
          config,
        })
        .subscribe({
          next: () => {
            this.salvando = false;
            this.voltarParaLista();
          },
          error: () => {
            this.error = 'Erro ao salvar dashboard.';
            this.salvando = false;
          },
        });
    } else {
      // Criar novo
      this.dashboard
        .criarDashboard({
          usuario_id: uid,
          titulo,
          chart_type: this.chartType,
          config,
        })
        .subscribe({
          next: () => {
            this.salvando = false;
            this.voltarParaLista();
          },
          error: () => {
            this.error = 'Erro ao criar dashboard.';
            this.salvando = false;
          },
        });
    }
  }

  async confirmarExclusao() {
    if (!this.dashboardEditId) return;

    const alert = await this.alertCtrl.create({
      header: 'Excluir visualização',
      message: 'Tem certeza que deseja excluir este dashboard? Esta ação não pode ser desfeita.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.executarExclusao(this.dashboardEditId!);
          },
        },
      ],
    });

    await alert.present();
  }

  private executarExclusao(id: number) {
    this.dashboard.excluirDashboard(id).subscribe({
      next: () => {
        this.voltarParaLista();
      },
      error: () => {
        this.error = 'Erro ao excluir dashboard.';
      },
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
