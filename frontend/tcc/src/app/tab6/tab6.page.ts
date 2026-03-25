import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  MenuController,
  IonMenuButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { DashboardViewComponent } from "../components/dashboard-view/dashboard-view.component";
import { MyDashboardViewComponent } from "../components/my-dashboard-view/my-dashboard-view.component";
import { DashboardMode } from '../services/dashboard-mode';

@Component({
  selector: 'app-tab6',
  templateUrl: './tab6.page.html',
  styleUrls: ['./tab6.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
    IonButtons,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonMenuButton,
    DashboardViewComponent,
    MyDashboardViewComponent
],
})
export class Tab6Page implements OnInit {
  modoSelecionado: string = 'dashboard';

  auth = inject(AuthService);
  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private modoService: DashboardMode
  ) {}
  
  ngOnInit(): void {
    this.modoService.modoSelecionado$.subscribe(modo => {
      this.modoSelecionado = modo;
    })
  }
  
  async openMenu() {
    await this.menuCtrl.open();
  }

  mudarModo(event: CustomEvent) {
    this.modoSelecionado = event.detail.value;
  }
}
