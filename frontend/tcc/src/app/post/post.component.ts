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
  isIaModalOpen = false;
  iaResumo = '';
  iaCarregando = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private proposicaoService: ProposicaoService,
    private reacaoService: ReacaoService,
    private reacaoEvent: ReacaoEventService,
    private shareService: ShareService,
    private iaService: IaService
  ) {}

  ngOnInit() {
    this.carregarPost();
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  get usuarioId(): number | null {
    return this.auth.getUsuarioId();
  }

  carregarPost() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.proposicaoService.buscarPorId(id, this.usuarioId).subscribe({
      next: (data) => {
        if (data) { this.post = data; }
      },
      error: (err) => {
        console.error('Erro ao carregar proposição', err);
      },
    });
  }

  likeIconName(): string {
    return this.post?.currentUserReaction === 'LIKE' ? 'thumbs-up' : 'thumbs-up-outline';
  }

  dislikeIconName(): string {
    return this.post?.currentUserReaction === 'DISLIKE' ? 'thumbs-down' : 'thumbs-down-outline';
  }

  reagir(tipo: 'LIKE' | 'DISLIKE') {
    if (this.usuarioId == null || !this.post) { return; }

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
}
