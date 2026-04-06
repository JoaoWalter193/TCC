import { Component, EventEmitter, Input, Output } from '@angular/core';
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
import { TipoProposicao } from 'src/app/models/dto/tipo-proposicao-enum';

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
  @Output() tipoFiltrado = new EventEmitter<TipoProposicao>();

  constructor() {}

  filtrarChip(event: Event, tipo: TipoProposicao) {
    event.stopPropagation();
    event.preventDefault();
    this.tipoFiltrado.emit(tipo);
  }
}
