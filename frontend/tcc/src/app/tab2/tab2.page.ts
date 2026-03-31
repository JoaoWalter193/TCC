import { Component, inject, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonButtons,
  IonMenuButton,
} from '@ionic/angular/standalone';

import { AuthService } from '../services/auth.service';
import { CardComponent } from '../components/card/card.component';
import { Router } from '@angular/router';
import { ProposicaoDTO } from '../models/dto/proposicao-dto';
import { ProposicaoService } from '../services/proposicao';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonButton,
    CardComponent,
    IonButtons,
    IonMenuButton,
  ],
})
export class Tab2Page implements OnInit {
  auth = inject(AuthService);

  posts: ProposicaoDTO[] = [];

  constructor(private router: Router, private proposicaoService: ProposicaoService) {}

  ngOnInit() {
    this.carregarPosts();
  }

  carregarPosts() {
    this.proposicaoService.listar().subscribe({
      next: (data) => {
        this.posts = data;
      },
      error: (err) => {
        console.error('Erro ao carregar proposições', err);
      },
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
