import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonContent, IonButton, IonButtons, IonMenuButton, IonIcon, IonRefresher, IonRefresherContent, IonPopover, IonInfiniteScroll, IonInfiniteScrollContent, IonSearchbar } from '@ionic/angular/standalone';

import { AuthService } from '../services/auth.service';
import { CardComponent } from '../components/card/card.component';
import { MenuPanelComponent } from '../components/menu-panel/menu-panel.component';
import { VereadorTableComponent } from '../components/vereador-table/vereador-table.component';
import { Router } from '@angular/router';
import { ProposicaoDTO } from '../models/dto/proposicao-dto';
import { VereadorDTO } from '../models/dto/vereador-dto';
import { ProposicaoService } from '../services/proposicao';
import { VereadorService } from '../services/vereador';
import { ApiGatewayService } from '../services/api-gateway.service';
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
    FormsModule,
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
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSearchbar,
  ],
})
export class Tab2Page {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  auth = inject(AuthService);
  private reacaoEvent = inject(ReacaoEventService);
  private destroyRef = inject(DestroyRef);

  posts: ProposicaoDTO[] = [];
  postsFiltrados: ProposicaoDTO[] = [];
  paginaAtual = 0;
  totalElementos = 0;
  carregando = false;
  vereadoresCache: VereadorDTO[] = [];

  categoriasDisponiveis: string[] = [];
  temasDisponiveis: string[] = [];
  categoriasSelecionadas: string[] = [];
  temasSelecionados: string[] = [];

  searchCategoria = '';
  searchTag = '';

  get categoriasNaoSelecionadas(): string[] {
    return this.categoriasDisponiveis
      .filter(c => !this.categoriasSelecionadas.includes(c))
      .filter(c => !this.searchCategoria || c.toLowerCase().includes(this.searchCategoria.toLowerCase()));
  }

  get temasNaoSelecionados(): string[] {
    return this.temasDisponiveis
      .filter(t => !this.temasSelecionados.includes(t))
      .filter(t => !this.searchTag || t.toLowerCase().includes(this.searchTag.toLowerCase()));
  }

  constructor(
    private router: Router,
    private proposicaoService: ProposicaoService,
    private vereadorService: VereadorService,
    private api: ApiGatewayService,
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
    this.paginaAtual = 0;
    this.posts = [];
    this.postsFiltrados = [];
    this.categoriasSelecionadas = [];
    this.temasSelecionados = [];

    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }

    this.carregarCategorias();
    this.carregarTags();

    this.vereadorService.listar().pipe(
      catchError(() => of([] as VereadorDTO[])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(vs => {
      this.vereadoresCache = vs;
      this.carregarPagina();
    });
  }

  private mapearVereador(p: ProposicaoDTO): ProposicaoDTO {
    const vereadorMap = new Map(this.vereadoresCache.map(v => [v.nome.toLowerCase(), v.id]));
    return { ...p, vereador: { ...p.vereador, id: vereadorMap.get(p.vereador.nome.toLowerCase()) ?? p.vereador.id } };
  }

  private carregarCategorias() {
    this.api.v1.get<string[]>('/prop/tipos').subscribe({
      next: (tipos) => { this.categoriasDisponiveis = tipos.sort(); },
      error: () => { this.categoriasDisponiveis = []; },
    });
  }

  private carregarTags() {
    this.api.bi.get<string[]>('/tags').subscribe({
      next: (tags) => { this.temasDisponiveis = tags.sort(); },
      error: () => { this.temasDisponiveis = []; },
    });
  }

  private carregarPagina() {
    if (this.carregando) return;
    this.carregando = true;

    const uid = this.usuarioId;

    this.proposicaoService.listarPaginado(uid, this.paginaAtual, 20).pipe(
      catchError(() => of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 })),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(res => {
      const novos = res.content.map(p => this.mapearVereador(p));
      this.posts.push(...novos);
      this.totalElementos = res.totalElements;
      this.paginaAtual++;
      this.carregando = false;

      this.aplicarFiltros();

      if (this.infiniteScroll) {
        this.infiniteScroll.complete();
        if (this.posts.length >= this.totalElementos) {
          this.infiniteScroll.disabled = true;
        }
      }
    });
  }

  carregarMais() {
    this.carregarPagina();
  }

  recarregarDados(event: any) {
    this.paginaAtual = 0;
    this.posts = [];
    this.categoriasSelecionadas = [];
    this.temasSelecionados = [];

    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }

    this.carregarCategorias();
    this.carregarTags();

    const uid = this.usuarioId;

    forkJoin([
      this.proposicaoService.listarPaginado(uid, 0, 20).pipe(
        catchError(() => of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 }))
      ),
      this.vereadorService.listar().pipe(
        catchError(() => of([] as VereadorDTO[]))
      )
    ]).subscribe({
      next: ([page, vereadores]) => {
        this.vereadoresCache = vereadores;
        this.posts = page.content.map(p => this.mapearVereador(p));
        this.totalElementos = page.totalElements;
        this.paginaAtual = 1;

        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Erro ao carregar dados', err);
      },
      complete: () => {
        event.target.complete();
      },
    });
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
