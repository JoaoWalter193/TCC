import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonHeader,
  IonButtons,
  IonBackButton,
  IonMenuButton,
  IonContent,
  IonItem,
  IonList,
  IonToggle,
  IonButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.scss'],
  imports: [
    IonHeader,
    IonButtons,
    IonBackButton,
    IonMenuButton,
    IonContent,
    IonItem,
    IonList,
    IonToggle,
    FormsModule,
    IonButton,
    RouterLink
  ],
})
export class ConfiguracoesComponent implements OnInit {
  paletteToggle: boolean = false;
  notifyToggle: boolean = false;

  constructor() {}

  ngOnInit() {}

  toggleChange(event: CustomEvent) {}

  toggleNotify(event: CustomEvent) {}
}
