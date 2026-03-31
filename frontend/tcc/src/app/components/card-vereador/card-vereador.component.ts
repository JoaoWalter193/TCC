import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-card-vereador',
  templateUrl: './card-vereador.component.html',
  styleUrls: ['./card-vereador.component.scss'],
  imports: [IonCard, IonCardHeader, IonCardTitle, IonCardContent, RouterLink],
})
export class CardVereadorComponent  implements OnInit {
  @Input() post: any;
  @Input() link: any[] = [];
  constructor() { }

  ngOnInit() {}

}
