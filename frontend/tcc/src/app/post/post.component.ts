import { Component, inject, OnInit } from '@angular/core';
import { IonHeader, IonButtons, IonBackButton, IonButton, IonMenuButton, IonContent, IonIcon, IonTitle, IonToolbar, IonModal, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProposicaoDTO } from '../models/dto/proposicao-dto';
import { ProposicaoService } from '../services/proposicao';
import { ReacaoService } from '../services/reacao.service';
import { ReacaoEventService } from '../services/reacao-event.service';
import { ShareService } from '../services/share.service';
import { IaService } from '../services/ia.service';
import { FavoritosService } from '../services/favoritos.service';
import { VereadorService } from '../services/vereador';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  imports: [
    IonHeader,
    IonButtons,
    IonBackButton,
    IonButton,
    IonMenuButton,
    IonContent,
    IonIcon,
    IonTitle,
    IonToolbar,
    IonModal,
    IonSpinner
  ],
})
export class PostComponent implements OnInit {
  auth = inject(AuthService);
  post!: ProposicaoDTO;
  seguindo = false;
  carregandoStatusSeg = true;
  isIaModalOpen = false;
  iaResumo = '';
  iaCarregando = false;

  get usuarioId(): number | null {
    return this.auth.getUsuarioId();
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private proposicaoService: ProposicaoService,
    private reacaoService: ReacaoService,
    private reacaoEvent: ReacaoEventService,
    private shareService: ShareService,
    private iaService: IaService,
    private favoritosService: FavoritosService,
    private vereadorService: VereadorService,
  ) {}

  ngOnInit() {
    this.carregarPost();
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  verVereador(idVereador: number) {
    this.router.navigate(['/vereador', idVereador]);
  }

  carregarPost() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.proposicaoService.buscarPorId(id, this.usuarioId).subscribe({
      next: (data) => {
        if (data) {
          this.post = data;
          this.carregarStatusSeg();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar proposição', err);
      },
    });
  }

  carregarStatusSeg() {
    const uid = this.usuarioId;
    if (!uid || !this.post) {
      this.carregandoStatusSeg = false;
      return;
    }
    this.vereadorService.verificarStatusSeguindo(uid, this.post.vereador.id).subscribe({
      next: (status) => { this.seguindo = status; this.carregandoStatusSeg = false; },
      error: () => { this.carregandoStatusSeg = false; },
    });
  }

  toggleSeguir() {
    const uid = this.usuarioId;
    if (!uid || !this.post) { this.auth.showLoginPrompt(); return; }

    const anterior = this.seguindo;
    this.seguindo = !anterior;

    const obs = anterior
      ? this.vereadorService.deixarDeSeguir(uid, this.post.vereador.id)
      : this.vereadorService.seguir(uid, this.post.vereador.id);

    obs.subscribe({ error: () => { this.seguindo = anterior; } });
  }

  toggleFavorito() {
    if (this.usuarioId == null || !this.post) { this.auth.showLoginPrompt(); return; }

    const anterior = this.post.isFavorito;
    this.post.isFavorito = !anterior;

    const obs = anterior
      ? this.favoritosService.desfavoritar(this.usuarioId, this.post.id)
      : this.favoritosService.favoritar(this.usuarioId, this.post.id);

    obs.subscribe({ error: () => { this.post.isFavorito = anterior; } });
  }

  likeIconName(): string {
    return this.post?.currentUserReaction === 'LIKE' ? 'thumbs-up' : 'thumbs-up-outline';
  }

  dislikeIconName(): string {
    return this.post?.currentUserReaction === 'DISLIKE' ? 'thumbs-down' : 'thumbs-down-outline';
  }

  reagir(tipo: 'LIKE' | 'DISLIKE') {
    if (this.usuarioId == null || !this.post) { this.auth.showLoginPrompt(); return; }

    const estadoAnterior = this.post.currentUserReaction;
    const likesAnterior = this.post.likes;
    const dislikesAnterior = this.post.dislikes;

    if (estadoAnterior === tipo) {
      this.post.currentUserReaction = null;
      if (tipo === 'LIKE') { this.post.likes--; } else { this.post.dislikes--; }
    } else {
      if (estadoAnterior === 'LIKE') { this.post.likes--; }
      if (estadoAnterior === 'DISLIKE') { this.post.dislikes--; }
      this.post.currentUserReaction = tipo;
      if (tipo === 'LIKE') { this.post.likes++; } else { this.post.dislikes++; }
    }

    this.reacaoService.reagir(this.usuarioId, this.post.id, tipo).subscribe({
      next: () => this.reacaoEvent.emitir(),
      error: () => {
        this.post.currentUserReaction = estadoAnterior;
        this.post.likes = likesAnterior;
        this.post.dislikes = dislikesAnterior;
      }
    });
  }

  compartilhar() {
    const url = window.location.origin + '/proposicao/' + this.post.id;
    this.shareService.compartilharProposicao(
      'Proposição - CuritibAtiva',
      this.post.ementa.substring(0, 100),
      url,
    );
  }

  abrirIaModal() {
    if (!this.post) return;
    this.isIaModalOpen = true;
    this.iaCarregando = true;
    this.iaResumo = '';

    this.iaService.gerarResumo({
      codigo: this.post.id,
      tipo: this.post.tipoProposicao,
      vereador: this.post.vereador.nome,
      ementa: this.post.ementa,
      texto: this.post.texto || '',
      justificativa: this.post.justificativa || '',
      estado: this.post.encerrouTramitacao ? 'Tramitação encerrada' : 'Em tramitação',
      tag: this.post.tag,
    }).subscribe({
      next: (res) => {
        this.iaResumo = res.resumo;
        this.iaCarregando = false;
      },
      error: () => {
        this.iaResumo = 'Não foi possível gerar a explicação. Tente novamente.';
        this.iaCarregando = false;
      },
    });
  }

  fecharIaModal() {
    this.isIaModalOpen = false;
    this.iaResumo = '';
    this.iaCarregando = false;
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
}
