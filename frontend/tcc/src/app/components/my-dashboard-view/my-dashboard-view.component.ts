import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonButton } from "@ionic/angular/standalone";
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-my-dashboard-view',
  templateUrl: './my-dashboard-view.component.html',
  styleUrls: ['./my-dashboard-view.component.scss'],
  imports: [IonContent, IonIcon, IonButton],
})
export class MyDashboardViewComponent {

  auth = inject(AuthService);

  constructor(private router: Router) { }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
