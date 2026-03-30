import { Component } from '@angular/core';
import { IonBackButton, IonButtons, IonHeader, IonMenuButton, IonContent } from "@ionic/angular/standalone";
import { CardComponent } from "../components/card/card.component";
import { CardVereadorComponent } from "../components/card-vereador/card-vereador.component";
import { VisitadosDTO } from '../models/dto/visitados-dto';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.scss'],
  imports: [IonBackButton, IonButtons, IonHeader, IonMenuButton, IonContent, CardComponent, CardVereadorComponent],
})
export class HistoricoComponent {
  Visitados: VisitadosDTO[] = [];

  constructor() { }

}
