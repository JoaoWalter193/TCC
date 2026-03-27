import { Component, OnInit } from '@angular/core';
import { IonBackButton, IonButtons, IonHeader, IonMenuButton, IonContent } from "@ionic/angular/standalone";
import { CardComponent } from "../components/card/card.component";
import { PostDTO } from '../models/dto/post-dto';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.scss'],
  imports: [IonBackButton, IonButtons, IonHeader, IonMenuButton, IonContent, CardComponent],
})
export class HistoricoComponent {
  postsVisualizados: PostDTO[] = [];

  constructor() { }

}
