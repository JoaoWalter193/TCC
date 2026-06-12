import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonBackButton, IonButtons, IonHeader, IonToolbar, IonContent, IonIcon, IonText } from "@ionic/angular/standalone";
import { CardComponent } from "../components/card/card.component";
import { CardVereadorComponent } from "../components/card-vereador/card-vereador.component";
import { HistoricoItem } from '../models/historico.model';
import { HistoricoService } from '../services/historico.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.scss'],
  standalone: true,
  imports: [
    IonBackButton, IonButtons, IonHeader, IonToolbar, IonContent,
    IonIcon, IonText,
    CardComponent, CardVereadorComponent,
  ],
})
export class HistoricoComponent implements OnInit {
  historico: HistoricoItem[] = [];
  carregando = true;

  constructor(
    private historicoService: HistoricoService,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.carregar();
  }

  get usuarioId(): number | null {
    return this.auth.getUsuarioId();
  }

  irParaVereador(id: number) {
    this.router.navigate(['/vereador', id]);
  }

  private carregar(): void {
    this.historicoService.listar().subscribe({
      next: (items) => {
        this.historico = items.sort(
          (a, b) => new Date(b.dataAcesso).getTime() - new Date(a.dataAcesso).getTime(),
        );
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      },
    });
  }
}
