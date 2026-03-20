import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonSearchbar, IonText, IonRow, IonMenuButton, IonButtons } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonText,
    IonRow,
    IonMenuButton,
    IonButtons
],
})
export class Tab4Page {
  auth = inject(AuthService);
  router = inject(Router);
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  constructor() {}
}
