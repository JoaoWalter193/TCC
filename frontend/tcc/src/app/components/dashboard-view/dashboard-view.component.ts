import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { Dashboard } from 'src/app/services/dashboard';
import { IonContent } from "@ionic/angular/standalone";
import { AgGridModule } from 'ag-grid-angular';

@Component({
  selector: 'app-dashboard-view',
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.scss'],
  imports: [IonContent, AgGridModule],
})
export class DashboardViewComponent  implements OnInit {
  columnDefs: ColDef[] = [];
  rowData: any[] = [];

  constructor(private dashboardService: Dashboard) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.dashboardService.getDashboardDefault().subscribe({
      next: (data) => {
        this.columnDefs = data.columnDefs;
        this.rowData = data.rowData;
      },
      error: (err) => console.error('Erro ao carregar dashboard:', err)
    })
  }
}
