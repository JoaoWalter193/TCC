import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonSearchbar, IonMenuButton, IonButtons, IonText, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ProposicaoDTO } from '../models/dto/proposicao-dto';
import { ProposicaoService } from '../services/proposicao';
import { CardComponent } from '../components/card/card.component';
import { MenuPanelComponent } from '../components/menu-panel/menu-panel.component';
import { VereadorTableComponent } from '../components/vereador-table/vereador-table.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReacaoEventService } from '../services/reacao-event.service';

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
    IonMenuButton,
    IonButtons,
    CardComponent,
    IonText,
    IonSpinner,
    MenuPanelComponent,
    VereadorTableComponent,
  ],
})
export class Tab4Page {
  auth = inject(AuthService);
  private reacaoEvent = inject(ReacaoEventService);
  private destroyRef = inject(DestroyRef);

  postsDestaque: ProposicaoDTO[] = [];

  searchTerm = '';
  searchResults: ProposicaoDTO[] = [];
  isSearching = false;
  hasSearched = false;

  constructor(
    private router: Router,
    private proposicaoService: ProposicaoService,
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

  executarPesquisa(event: Event) {
    event.preventDefault();
    const termo = this.searchTerm.trim();
    if (!termo) return;

    this.hasSearched = true;
    this.isSearching = true;
    this.searchResults = [];

    this.proposicaoService.buscarPorSimilaridade(termo, 50, this.usuarioId).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearching = false;
      },
      error: () => {
        this.isSearching = false;
        this.searchResults = [];
      },
    });
  }

  irParaVereador(id: number) {
    this.router.navigate(['/vereador', id]);
  }

  limparPesquisa() {
    this.searchTerm = '';
    this.searchResults = [];
    this.hasSearched = false;
    this.isSearching = false;
  }
}
