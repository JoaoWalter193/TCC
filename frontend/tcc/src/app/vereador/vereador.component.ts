import { Component, inject, OnInit } from '@angular/core';
import { CardComponent } from '../components/card/card.component';
import {
  IonContent, IonButtons, IonMenuButton, IonBackButton,
  IonHeader, IonToolbar, IonButton, IonIcon, IonAvatar,
} from '@ionic/angular/standalone';
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
    IonContent, IonButtons, IonMenuButton, IonBackButton,
    IonHeader, IonToolbar, IonButton, IonIcon, IonAvatar,
  ],
})
export class VereadorComponent implements OnInit {
  auth = inject(AuthService);
  vereador!: VereadorDTO;
  proposicoes: ProposicaoDTO[] = [];
  vereadorId!: number;
  seguindo = false;
  carregandoStatus = true;

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

  get usuarioId(): number | null {
    const raw = localStorage.getItem('usuario_id');
    return raw ? Number(raw) : null;
  }

  get iniciais(): string {
    if (!this.vereador?.nome) return '';
    const partes = this.vereador.nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  toggleSeguir() {
    const uid = this.usuarioId;
    if (!uid) {
      this.router.navigate(['/login']);
      return;
    }

    const obs = this.seguindo
      ? this.vereadorService.deixarDeSeguir(uid, this.vereadorId)
      : this.vereadorService.seguir(uid, this.vereadorId);

    obs.pipe(catchError(() => of(null))).subscribe({
      next: () => {
        this.seguindo = !this.seguindo;
      },
    });
  }

  carregarDados() {
    const uid = this.usuarioId;

    const vereador$ = this.vereadorService.buscarPorId(this.vereadorId).pipe(
      catchError(() => of<VereadorDTO | undefined>(undefined))
    );

    const proposicoes$ = this.proposicaoService.listar().pipe(
      catchError(() => of<ProposicaoDTO[]>([]))
    );

    const status$ = uid
      ? this.vereadorService.verificarStatusSeguindo(uid, this.vereadorId).pipe(
          catchError(() => of(false))
        )
      : of(false);

    forkJoin([vereador$, proposicoes$, status$]).subscribe({
      next: ([vereador, proposicoes, status]) => {
        if (vereador) {
          this.vereador = vereador;
          const nomeLower = vereador.nome.toLowerCase();
          this.proposicoes = proposicoes.filter(
            p => p.vereador.nome.toLowerCase() === nomeLower
          );
        }
        this.seguindo = status;
        this.carregandoStatus = false;
      },
      error: () => {
        this.carregandoStatus = false;
      },
    });
  }
}
