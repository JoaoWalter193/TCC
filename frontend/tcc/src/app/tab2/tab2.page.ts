import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonGrid,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { CardComponent } from '../components/card/card.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonGrid,
    IonButton,
    IonIcon,
    CardComponent,
  ],
})
export class Tab2Page {
  auth = inject(AuthService);
  router = inject(Router);
  posts = [
    { id: 1, titulo: 'Post 1', texto: 'Conteúdo 1' },
    { id: 2, titulo: 'Post 2', texto: 'Conteúdo 2' },
    { id: 3, titulo: 'Post 3', texto: 'Conteúdo 3' },
  ];

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
