import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { FavoritosService } from '../services/favoritos.service';
import { VereadorService } from '../services/vereador';
import { ProposicaoDTO } from '../models/dto/proposicao-dto';
import { VereadorDTO } from '../models/dto/vereador-dto';
import { CardComponent } from '../components/card/card.component';
import { MenuPanelComponent } from '../components/menu-panel/menu-panel.component';
import { VereadorTableComponent } from '../components/vereador-table/vereador-table.component';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonContent,
    IonButton,
    IonButtons,
    IonMenuButton,
    IonIcon,
    CardComponent,
    MenuPanelComponent,
    VereadorTableComponent,
  ],
})
export class Tab5Page {
  private router = inject(Router);
  auth = inject(AuthService);
  private favoritosService = inject(FavoritosService);
  private vereadorService = inject(VereadorService);

  favoritos: ProposicaoDTO[] = [];
  vereadores: VereadorDTO[] = [];
  carregandoFavoritos = false;
  carregandoSeguindo = false;
  modoSelecionado: 'favoritos' | 'seguindo' = 'favoritos';

  get usuarioId(): number | null {
    return this.auth.getUsuarioId();
  }

  ionViewWillEnter() {
    this.carregarFavoritos();
    this.carregarSeguindo();
  }

  mudarModo(modo: 'favoritos' | 'seguindo') {
    this.modoSelecionado = modo;
  }

  carregarFavoritos() {
    const id = this.usuarioId;
    if (id == null) {
      this.favoritos = [];
      return;
    }

    this.carregandoFavoritos = true;
    this.favoritosService.listar(id).subscribe({
      next: (lista) => {
        this.favoritos = lista;
        this.carregandoFavoritos = false;
      },
      error: () => {
        this.favoritos = [];
        this.carregandoFavoritos = false;
      },
    });
  }

  private carregarSeguindo() {
    const id = this.usuarioId;
    if (id == null) {
      this.vereadores = [];
      return;
    }

    this.carregandoSeguindo = true;
    this.vereadorService.listarSeguindo(id).subscribe({
      next: (lista) => {
        this.vereadores = lista;
        this.carregandoSeguindo = false;
      },
      error: () => {
        this.vereadores = [];
        this.carregandoSeguindo = false;
      },
    });
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }

  verVereador(idVereador: number) {
    this.router.navigate(['/vereador', idVereador]);
  }

  irParaVereador(id: number) {
    this.router.navigate(['/vereador', id]);
  }

  deixarDeSeguir(event: Event, vereadorId: number) {
    event.stopPropagation();
    const id = this.usuarioId;
    if (id == null) return;

    const anterior = this.vereadores;
    this.vereadores = this.vereadores.filter(v => v.id !== vereadorId);

    this.vereadorService.deixarDeSeguir(id, vereadorId).subscribe({
      error: () => { this.vereadores = anterior; },
    });
  }

  trackById(_index: number, item: ProposicaoDTO) {
    return item.id;
  }
}
