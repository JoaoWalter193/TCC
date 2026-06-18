import { Component, DestroyRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonSearchbar, IonMenuButton, IonButtons, IonText, IonSpinner, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ProposicaoDTO } from '../models/dto/proposicao-dto';
import { VereadorDTO } from '../models/dto/vereador-dto';
import { ProposicaoService } from '../services/proposicao';
import { VereadorService } from '../services/vereador';
import { CardComponent } from '../components/card/card.component';
import { VereadorSearchCardComponent } from '../components/vereador-search-card/vereador-search-card.component';
import { MenuPanelComponent } from '../components/menu-panel/menu-panel.component';
import { VereadorTableComponent } from '../components/vereador-table/vereador-table.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReacaoEventService } from '../services/reacao-event.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonMenuButton,
    IonButtons,
    IonRefresher,
    IonRefresherContent,
    CardComponent,
    IonText,
    IonSpinner,
    MenuPanelComponent,
    VereadorTableComponent,
    VereadorSearchCardComponent,
  ],
})
export class Tab4Page {
  auth = inject(AuthService);
  private reacaoEvent = inject(ReacaoEventService);
  private destroyRef = inject(DestroyRef);

  postsDestaque: ProposicaoDTO[] = [];
  destaqueModo: 'proposicoes' | 'vereadores' = 'proposicoes';

  searchTerm = '';
  searchResults: ProposicaoDTO[] = [];
  vereadorResults: VereadorDTO[] = [];
  isSearching = false;
  hasSearched = false;

  constructor(
    private router: Router,
    private proposicaoService: ProposicaoService,
    private vereadorService: VereadorService,
  ) {
    this.reacaoEvent.reacaoAlterada$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.carregarPostsDestaque());
  }

  ngOnInit() {
    this.carregarPostsDestaque();
  }

  get usuarioId(): number | null {
    return this.auth.getUsuarioId();
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 1024) {
      this.destaqueModo = 'proposicoes';
    }
  }

  mudarDestaqueModo(modo: 'proposicoes' | 'vereadores') {
    this.destaqueModo = modo;
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  carregarPostsDestaque() {
    this.proposicaoService.listar(this.usuarioId).subscribe({
      next: (data) => {
        this.postsDestaque = data
          .sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes))
          .slice(0, 4);
      },
      error: (err) => {
        console.error('Erro ao carregar proposições', err);
      },
    });
  }

  recarregarDados(event: any) {
    this.proposicaoService.listar(this.usuarioId).subscribe({
      next: (data) => {
        this.postsDestaque = data
          .sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes))
          .slice(0, 4);
        this.limparPesquisa();
      },
      error: (err) => {
        console.error('Erro ao carregar proposições', err);
      },
      complete: () => {
        event.target.complete();
      },
    });
  }

  executarPesquisa(event: Event) {
    event.preventDefault();
    const termo = this.searchTerm.trim();
    if (!termo) return;

    this.hasSearched = true;
    this.isSearching = true;
    this.searchResults = [];
    this.vereadorResults = [];

    forkJoin({
      vereadores: this.vereadorService.buscarPorNome(termo).pipe(catchError(() => of([]))),
      proposicoes: this.proposicaoService.buscarPorSimilaridade(termo, 50, this.usuarioId).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ vereadores, proposicoes }) => {
        this.vereadorResults = vereadores;
        this.searchResults = proposicoes;
        this.isSearching = false;
      },
      error: () => {
        this.isSearching = false;
      },
    });
  }

  irParaVereador(id: number) {
    this.router.navigate(['/vereador', id]);
  }

  limparPesquisa() {
    this.searchTerm = '';
    this.searchResults = [];
    this.vereadorResults = [];
    this.hasSearched = false;
    this.isSearching = false;
  }
}
