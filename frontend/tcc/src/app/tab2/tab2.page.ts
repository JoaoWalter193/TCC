import { Component, inject, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, IonButton, IonButtons, IonMenuButton, IonChip, IonLabel, IonIcon } from '@ionic/angular/standalone';

import { AuthService } from '../services/auth.service';
import { CardComponent } from '../components/card/card.component';
import { Router } from '@angular/router';
import { ProposicaoDTO } from '../models/dto/proposicao-dto';
import { ProposicaoService } from '../services/proposicao';
import { TipoProposicao } from '../models/dto/tipo-proposicao-enum';

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
    IonChip,
    IonLabel,
    IonIcon
],
})
export class Tab2Page implements OnInit {
  auth = inject(AuthService);

  posts: ProposicaoDTO[] = [];
  postsFiltrados: ProposicaoDTO[] = [];
  tipoFiltroAtivo: TipoProposicao | null = null;

  constructor(
    private router: Router,
    private proposicaoService: ProposicaoService,
  ) {}

  ngOnInit() {
    this.carregarPosts();
  }

  carregarPosts() {
    this.proposicaoService.listar().subscribe({
      next: (data) => {
        this.posts = data;
        this.postsFiltrados = data;
      },
      error: (err) => {
        console.error('Erro ao carregar proposições', err);
      },
    });
  }

  filtrarPorTipo(tipoProposicao: TipoProposicao) {
    this.tipoFiltroAtivo = tipoProposicao;

    this.postsFiltrados = this.posts.filter(
      (post) => post.tipoProposicao === tipoProposicao,
    );
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  limparFiltro() {
    this.tipoFiltroAtivo = null;
    this.postsFiltrados = this.posts;
  }
}
