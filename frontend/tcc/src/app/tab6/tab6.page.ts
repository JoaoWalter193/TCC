import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonButton, IonIcon, IonText, IonList, IonItem, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab6',
  templateUrl: './tab6.page.html',
  styleUrls: ['./tab6.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, CommonModule, FormsModule, IonButton, IonIcon, IonText, IonList, IonItem, IonSelect, IonSelectOption]
})
export class Tab6Page {
  auth = inject(AuthService);
  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  constructor(private router: Router) { }
}
