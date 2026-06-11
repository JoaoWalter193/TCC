import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonIcon } from "@ionic/angular/standalone";
import { VereadorDTO } from 'src/app/models/dto/vereador-dto';

@Component({
  selector: 'app-card-vereador',
  templateUrl: './card-vereador.component.html',
  styleUrls: ['./card-vereador.component.scss'],
  imports: [IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonIcon, RouterLink],
})
export class CardVereadorComponent {
  @Input() post!: VereadorDTO;
  @Input() link: any[] = [];
}
