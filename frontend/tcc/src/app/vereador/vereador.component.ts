import { Component, inject, OnInit } from '@angular/core';
import {
  IonContent, IonButtons, IonMenuButton, IonBackButton,
  IonHeader, IonToolbar, IonButton, IonIcon, IonAvatar,
} from '@ionic/angular/standalone';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { VereadorDTO } from '../models/dto/vereador-dto';
import { ProposicaoDTO } from '../models/dto/proposicao-dto';
import { VereadorService } from '../services/vereador';
import { ProposicaoService } from '../services/proposicao';
import { AuthService } from '../services/auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormatCodigoPipe } from '../pipes/format-codigo.pipe';
import { FormatTelefonePipe } from '../pipes/format-telefone-pipe';
import { ShareService } from '../services/share.service';

@Component({
  selector: 'app-vereador',
  templateUrl: './vereador.component.html',
  styleUrls: ['./vereador.component.scss'],
  imports: [
    IonContent, IonButtons, IonMenuButton, IonBackButton,
    IonHeader, IonToolbar, IonButton, IonIcon, IonAvatar,
    RouterLink, FormatCodigoPipe, FormatTelefonePipe,
    DatePipe, TitleCasePipe
  ],
})
export class VereadorComponent implements OnInit {
  auth = inject(AuthService);
  private shareService = inject(ShareService);
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
      this.auth.showLoginPrompt();
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

  compartilhar() {
    const url = window.location.origin + '/vereador/' + this.vereadorId;
    this.shareService.compartilharProposicao(
      'Vereador - CuritibAtiva',
      this.vereador.nome + ' · ' + this.vereador.partido,
      url,
    );
  }

  timelineIcon(tipo: string): string {
    const mapa: Record<string, string> = {
      'PROJETO_DE_LEI': 'document-text-outline',
      'REQUERIMENTO': 'chatbox-ellipses-outline',
      'INDICACAO': 'bulb-outline',
      'EMENDA': 'create-outline',
      'MOÇÃO': 'megaphone-outline',
      'PEDIDO_DE_INFORMACAO': 'search-outline',
    };
    return mapa[tipo] || 'document-outline';
  }

  formatarData(data: string): string {
    if (!data) return '';
    const d = new Date(data);
    const agora = new Date();
    const diffMs = Math.abs(agora.getTime() - d.getTime());
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffDias === 0) return 'Hoje';
    if (diffDias === 1) return 'Ontem';
    if (diffDias < 7) return `Há ${diffDias} dias`;

    const dia = String(d.getDate()).padStart(2, '0');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const mes = meses[d.getMonth()];
    const ano = d.getFullYear();
    const anoAtual = agora.getFullYear();

    return ano === anoAtual ? `${dia} ${mes}` : `${dia} ${mes} ${ano}`;
  }

  formatarEscolaridade(valor: string): string {
    const mapa: Record<string, string> = {
      'sup_comp': 'Superior completo',
      'sup_incomp': 'Superior incompleto',
      'ens_fund_comp': 'Ensino fundamental completo',
      'ens_fund_incomp': 'Ensino fundamental incompleto',
    };
    return mapa[valor] || valor;
  }

  carregarDados() {
    const uid = this.usuarioId;

    const vereador$ = this.vereadorService.buscarPorId(this.vereadorId).pipe(
      catchError(() => of<VereadorDTO | undefined>(undefined))
    );

    const proposicoes$ = this.proposicaoService.listarPorVereador(this.vereadorId, uid).pipe(
      catchError(() => of([] as ProposicaoDTO[]))
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
          this.proposicoes = proposicoes;
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
