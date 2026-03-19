import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, IonIcon, IonCol, IonButton } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [IonHeader, IonToolbar, IonContent, IonIcon, IonCol, IonButton],
})
export class Tab3Page {
  auth = inject(AuthService);
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  router = inject(Router);
  constructor() {}
}
