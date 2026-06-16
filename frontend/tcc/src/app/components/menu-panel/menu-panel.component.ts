import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { DashboardMode } from 'src/app/services/dashboard-mode';

@Component({
  selector: 'app-menu-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, IonIcon],
  template: `
    <aside class="menu-panel">
      <nav class="panel-nav">
        <a class="panel-item" routerLink="/perfil">
          <ion-icon name="person-outline"></ion-icon>
          <span>Perfil</span>
        </a>
        <a class="panel-item" routerLink="/historico">
          <ion-icon name="time-outline"></ion-icon>
          <span>Histórico</span>
        </a>
        <a class="panel-item" (click)="navMeusDashboards()">
          <ion-icon name="bar-chart-outline"></ion-icon>
          <span>Meus Dashboards</span>
        </a>
        <a class="panel-item" routerLink="/configuracoes">
          <ion-icon name="settings-outline"></ion-icon>
          <span>Configurações</span>
        </a>
      </nav>
    </aside>
  `,
  styles: [`
    .menu-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 20px 12px;
    }
    .panel-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 6px 20px;
      border-bottom: 1px solid var(--ion-border-color);
      margin-bottom: 12px;
    }
    .panel-logo {
      width: 28px;
      height: 28px;
      border-radius: 6px;
    }
    .panel-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--ion-text-color);
    }
    .panel-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .panel-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 10px;
      border-radius: 10px;
      text-decoration: none;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--ion-text-color);
      transition: background 0.15s;
    }
    .panel-item:hover {
      background: var(--ion-color-step-50);
    }
    .panel-item:active {
      background: rgba(var(--ion-color-primary-rgb), 0.08);
    }
    .panel-item ion-icon {
      font-size: 1.2rem;
      color: var(--ion-color-primary);
      flex-shrink: 0;
    }
  `]
})
export class MenuPanelComponent {
  constructor(private modoService: DashboardMode, private router: Router) {}

  navMeusDashboards() {
    this.modoService.setModo('my-dashboard');
    this.router.navigate(['tabs/tab6']);
  }
}
