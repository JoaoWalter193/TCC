import { Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonContent, IonButton, IonButtons, IonMenuButton, IonIcon, IonRefresher, IonRefresherContent, IonPopover } from '@ionic/angular/standalone';

import { AuthService } from '../services/auth.service';
import { CardComponent } from '../components/card/card.component';
import { MenuPanelComponent } from '../components/menu-panel/menu-panel.component';
import { VereadorTableComponent } from '../components/vereador-table/vereador-table.component';
import { Router } from '@angular/router';
import { ProposicaoDTO } from '../models/dto/proposicao-dto';
import { VereadorDTO } from '../models/dto/vereador-dto';
import { ProposicaoService } from '../services/proposicao';
import { VereadorService } from '../services/vereador';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReacaoEventService } from '../services/reacao-event.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonContent,
    IonButton,
    IonRefresher,
    IonRefresherContent,
    CardComponent,
    IonButtons,
    IonMenuButton,
    IonIcon,
    MenuPanelComponent,
    VereadorTableComponent,
    IonPopover,
  ],
})
export class Tab2Page {
  auth = inject(AuthService);
  private reacaoEvent = inject(ReacaoEventService);
  private destroyRef = inject(DestroyRef);

  posts: ProposicaoDTO[] = [];
  postsFiltrados: ProposicaoDTO[] = [];

  categoriasDisponiveis: string[] = [];
  temasDisponiveis: string[] = [];
  categoriasSelecionadas: string[] = [];
  temasSelecionados: string[] = [];

  get categoriasNaoSelecionadas(): string[] {
    return this.categoriasDisponiveis.filter(c => !this.categoriasSelecionadas.includes(c));
  }

  get temasNaoSelecionados(): string[] {
    return this.temasDisponiveis.filter(t => !this.temasSelecionados.includes(t));
  }

  constructor(
    private router: Router,
    private proposicaoService: ProposicaoService,
    private vereadorService: VereadorService,
  ) {
    this.reacaoEvent.reacaoAlterada$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.carregarPosts());
  }

  ionViewWillEnter() {
    this.carregarPosts();
  }

  get usuarioId(): number | null {
    return this.auth.getUsuarioId();
  }

  carregarPosts() {
    forkJoin([
      this.proposicaoService.listar(this.usuarioId).pipe(
        catchError(() => of([] as ProposicaoDTO[]))
      ),
      this.vereadorService.listar().pipe(
        catchError(() => of([] as VereadorDTO[]))
      )
    ]).subscribe({
      next: ([proposicoes, vereadores]: [ProposicaoDTO[], VereadorDTO[]]) => {
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

        this.extrairFiltros();
        this.postsFiltrados = [...this.posts];
      },
      error: (err) => {
        console.error('Erro ao carregar dados', err);
      },
    });
  }

  recarregarDados(event: any) {
    const uid = this.usuarioId;
    forkJoin([
      this.proposicaoService.listar(uid).pipe(
        catchError(() => of([] as ProposicaoDTO[]))
      ),
      this.vereadorService.listar().pipe(
        catchError(() => of([] as VereadorDTO[]))
      )
    ]).subscribe({
      next: ([proposicoes, vereadores]: [ProposicaoDTO[], VereadorDTO[]]) => {
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

        this.categoriasSelecionadas = [];
        this.temasSelecionados = [];
        this.extrairFiltros();
        this.postsFiltrados = [...this.posts];
      },
      error: (err) => {
        console.error('Erro ao carregar dados', err);
      },
      complete: () => {
        event.target.complete();
      },
    });
  }

  private extrairFiltros() {
    this.categoriasDisponiveis = [...new Set(this.posts.map(p => p.tipoProposicao))].sort();
    this.temasDisponiveis = [...new Set(this.posts.map(p => p.tag).filter(Boolean))].sort();
  }

  aplicarFiltros() {
    let filtrados = this.posts;

    if (this.categoriasSelecionadas.length > 0) {
      filtrados = filtrados.filter(p => this.categoriasSelecionadas.includes(p.tipoProposicao));
    }

    if (this.temasSelecionados.length > 0) {
      filtrados = filtrados.filter(p => this.temasSelecionados.includes(p.tag));
    }

    this.postsFiltrados = filtrados;
  }

  toggleCategoria(cat: string) {
    const idx = this.categoriasSelecionadas.indexOf(cat);
    if (idx >= 0) {
      this.categoriasSelecionadas.splice(idx, 1);
    } else {
      this.categoriasSelecionadas.push(cat);
    }
    this.aplicarFiltros();
  }

  toggleTema(tema: string) {
    const idx = this.temasSelecionados.indexOf(tema);
    if (idx >= 0) {
      this.temasSelecionados.splice(idx, 1);
    } else {
      this.temasSelecionados.push(tema);
    }
    this.aplicarFiltros();
  }

  filtrarPorTipo(tipoProposicao: string) {
    this.categoriasSelecionadas = [tipoProposicao];
    this.temasSelecionados = [];
    this.aplicarFiltros();
  }

  limparFiltros() {
    this.categoriasSelecionadas = [];
    this.temasSelecionados = [];
    this.postsFiltrados = [...this.posts];
  }

  formatarTag(tag: string): string {
    return tag
      .split('-')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  }

  verVereador(idVereador: number) {
    this.router.navigate(['/vereador', idVereador]);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
