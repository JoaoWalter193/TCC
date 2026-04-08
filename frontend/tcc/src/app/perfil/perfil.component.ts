import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonButtons, IonBackButton, IonMenuButton, IonHeader, IonList, IonItem, IonIcon, IonLabel, IonToolbar } from '@ionic/angular/standalone';
import { DashboardMode } from '../services/dashboard-mode';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  imports: [
    IonContent,
    IonButtons,
    IonBackButton,
    IonMenuButton,
    IonHeader,
    IonList,
    IonItem,
    RouterLink,
    IonIcon,
    IonLabel,
    IonToolbar
],
})
export class PerfilComponent {
  constructor(
    private modoService: DashboardMode,
    private router: Router,
  ) {}

  navMeusDashboards() {
    this.modoService.setModo('my-dashboard');
    this.router.navigate(['tabs/tab6']);
  }
}
