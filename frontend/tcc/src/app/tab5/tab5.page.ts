import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { FavoritosService } from '../services/favoritos.service';
import { ProposicaoDTO } from '../models/dto/proposicao-dto';
import { CardComponent } from '../components/card/card.component';
import { MenuPanelComponent } from '../components/menu-panel/menu-panel.component';
import { VereadorTableComponent } from '../components/vereador-table/vereador-table.component';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
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

  favoritos: ProposicaoDTO[] = [];
  carregando = false;

  get usuarioId(): number | null {
    return this.auth.getUsuarioId();
  }

  ionViewWillEnter() {
    this.carregarFavoritos();
  }

  carregarFavoritos() {
    const id = this.usuarioId;
    if (id == null) {
      this.favoritos = [];
      return;
    }

    this.carregando = true;
    this.favoritosService.listar(id).subscribe({
      next: (lista) => {
        this.favoritos = lista;
        this.carregando = false;
      },
      error: () => {
        this.favoritos = [];
        this.carregando = false;
      },
    });
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }

  verProposicao(id: number) {
    this.router.navigate(['/proposicao', id]);
  }

  verVereador(idVereador: number) {
    this.router.navigate(['/vereador', idVereador]);
  }

  trackById(_index: number, item: ProposicaoDTO) {
    return item.id;
  }
}
