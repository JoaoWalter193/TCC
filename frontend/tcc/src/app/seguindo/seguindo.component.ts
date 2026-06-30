import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { VereadorService } from '../services/vereador';
import { VereadorDTO } from '../models/dto/vereador-dto';
import { TruncateNomePipe } from '../pipes/truncate-nome.pipe';

@Component({
  selector: 'app-seguindo',
  templateUrl: './seguindo.component.html',
  styleUrls: ['./seguindo.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonText,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonButton,
    TruncateNomePipe,
  ],
})
export class SeguindoComponent {
  private router = inject(Router);
  auth = inject(AuthService);
  private vereadorService = inject(VereadorService);

  vereadores: VereadorDTO[] = [];
  carregando = false;

  get usuarioId(): number | null {
    return this.auth.getUsuarioId();
  }

  ionViewWillEnter() {
    this.carregar();
  }

  private carregar() {
    const id = this.usuarioId;
    if (id == null) {
      this.vereadores = [];
      return;
    }

    this.carregando = true;
    this.vereadorService.listarSeguindo(id).subscribe({
      next: (lista) => {
        this.vereadores = lista;
        this.carregando = false;
      },
      error: () => {
        this.vereadores = [];
        this.carregando = false;
      },
    });
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

  trackById(_index: number, item: VereadorDTO) {
    return item.id;
  }
}
