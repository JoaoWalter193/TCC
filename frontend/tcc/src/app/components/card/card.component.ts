import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonChip,
  IonLabel,
} from '@ionic/angular/standalone';
import { ProposicaoDTO } from 'src/app/models/dto/proposicao-dto';
import { ReacaoService } from 'src/app/services/reacao.service';
import { ReacaoEventService } from 'src/app/services/reacao-event.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    RouterLink,
    IonIcon,
    IonChip,
    IonLabel,
  ],
})
export class CardComponent {
  @Input() post!: ProposicaoDTO;
  @Input() link: any[] = [];
  @Input() usuarioId: number | null = null;
  @Output() tipoFiltrado = new EventEmitter<string>();
  @Output() verVereador = new EventEmitter<number>();

  private reacaoService = inject(ReacaoService);
  private reacaoEvent = inject(ReacaoEventService);

  filtrarChip(event: Event, tipo: string) {
    event.stopPropagation();
    event.preventDefault();
    this.tipoFiltrado.emit(tipo);
  }

  favoritar(event: Event, post: any) {
    event.stopPropagation();
    event.preventDefault();
  }

  verVerador(event: Event, idVereador: number) {
    event.stopPropagation();
    event.preventDefault();
    this.verVereador.emit(idVereador);
  }

  compartilhar(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    const url = window.location.origin + '/proposicao/' + this.post.id;
    this.shareService.compartilharProposicao(
      'Proposição - CuritibAtiva',
      this.post.ementa.substring(0, 100),
      url,
    );
  }

  likeIconName(): string {
    return this.post.currentUserReaction === 'LIKE' ? 'thumbs-up' : 'thumbs-up-outline';
  }

  dislikeIconName(): string {
    return this.post.currentUserReaction === 'DISLIKE' ? 'thumbs-down' : 'thumbs-down-outline';
  }

  reagir(event: Event, tipo: 'LIKE' | 'DISLIKE') {
    event.stopPropagation();
    event.preventDefault();
    if (this.usuarioId == null) { return; }

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
}
