import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonButton, IonIcon, IonCol, IonText } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    IonCol,
    IonText
],
})
export class Tab5Page {
  auth = inject(AuthService);
  router = inject(Router);

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  constructor() {}
}
