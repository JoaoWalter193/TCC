import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { VereadorDTO } from 'src/app/models/dto/vereador-dto';

@Component({
  selector: 'app-vereador-search-card',
  templateUrl: './vereador-search-card.component.html',
  styleUrls: ['./vereador-search-card.component.scss'],
  standalone: true,
  imports: [IonCard, IonCardContent, IonIcon, RouterLink],
})
export class VereadorSearchCardComponent {
  @Input() vereador!: VereadorDTO;
  @Input() link: any[] = [];
}
