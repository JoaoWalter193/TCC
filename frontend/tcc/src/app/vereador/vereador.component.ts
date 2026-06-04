import { Component, inject, OnInit } from '@angular/core';
import { CardComponent } from '../components/card/card.component';
import { IonContent, IonButtons, IonMenuButton, IonBackButton, IonHeader, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { VereadorDTO } from '../models/dto/vereador-dto';
import { ProposicaoDTO } from '../models/dto/proposicao-dto';
import { ActivatedRoute, Router } from '@angular/router';
import { VereadorService } from '../services/vereador';
import { ProposicaoService } from '../services/proposicao';
import { AuthService } from '../services/auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-vereador',
  templateUrl: './vereador.component.html',
  styleUrls: ['./vereador.component.scss'],
  imports: [
    CardComponent,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonBackButton,
    IonHeader,
    IonToolbar,
    IonButton
],
})
export class VereadorComponent implements OnInit {
  auth = inject(AuthService);
  vereador!: VereadorDTO;
  proposicoes: ProposicaoDTO[] = [];
  vereadorId!: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private vereadorService: VereadorService,
    private proposicaoService: ProposicaoService,
  ) {}

  ngOnInit() {
    this.vereadorId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregarDados();
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  carregarDados() {
    forkJoin([
      this.vereadorService.buscarPorId(this.vereadorId).pipe(catchError(() => of(undefined))),
      this.proposicaoService.listar().pipe(catchError(() => of([])))
    ]).subscribe({
      next: ([vereador, proposicoes]) => {
        if (vereador) {
          this.vereador = vereador;
          const nomeLower = vereador.nome.toLowerCase();
          this.proposicoes = proposicoes.filter(
            p => p.vereador.nome.toLowerCase() === nomeLower
          );
        }
      },
      error: (err) => {
        console.error('Erro ao carregar dados do vereador', err);
      },
    });
  }
}
