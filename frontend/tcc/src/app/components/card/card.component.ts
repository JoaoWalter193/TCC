import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon } from "@ionic/angular/standalone";
import { ProposicaoDTO } from 'src/app/models/dto/proposicao-dto';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  imports: [IonCard, IonCardHeader, IonCardTitle, IonCardContent, RouterLink, IonButton, IonIcon],
})
export class CardComponent {
  @Input() post!: ProposicaoDTO;
  @Input() link: any[] = [];
  constructor() { }

}
