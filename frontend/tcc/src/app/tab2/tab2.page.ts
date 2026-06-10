import { Component, inject, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, IonButton, IonButtons, IonMenuButton, IonChip, IonLabel, IonIcon } from '@ionic/angular/standalone';

import { AuthService } from '../services/auth.service';
import { CardComponent } from '../components/card/card.component';
import { Router } from '@angular/router';
import { ProposicaoDTO } from '../models/dto/proposicao-dto';
import { ProposicaoService } from '../services/proposicao';
import { VereadorService } from '../services/vereador';
import { forkJoin } from 'rxjs';

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
  tipoFiltroAtivo: string | null = null;

  constructor(
    private router: Router,
    private proposicaoService: ProposicaoService,
    private vereadorService: VereadorService,
  ) {}

  ngOnInit() {
    this.carregarPosts();
  }

  get usuarioId(): number | null {
    return this.auth.getUsuarioId();
  }

  carregarPosts() {
    forkJoin([
      this.proposicaoService.listar(this.usuarioId),
      this.vereadorService.listar()
    ]).subscribe({
      next: ([proposicoes, vereadores]) => {
        const vereadorMap = new Map(
          vereadores.map(v => [v.nome.toLowerCase(), v.id])
        );

        this.posts = proposicoes.map(p => ({
          ...p,
          vereador: {
            ...p.vereador,
            id: vereadorMap.get(p.vereador.nome.toLowerCase()) ?? p.vereador.id
          }
        }));

        this.postsFiltrados = [...this.posts];
      },
      error: (err) => {
        console.error('Erro ao carregar dados', err);
      },
    });
  }

  filtrarPorTipo(tipoProposicao: string) {
    this.tipoFiltroAtivo = tipoProposicao;

    this.postsFiltrados = this.posts.filter(
      (post) => post.tipoProposicao === tipoProposicao,
    );
  }

  verVereador(idVereador: number) {
    this.router.navigate(['/vereador', idVereador]);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  limparFiltro() {
    this.tipoFiltroAtivo = null;
    this.postsFiltrados = this.posts;
  }
}
