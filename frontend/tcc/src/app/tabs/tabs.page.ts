import { Component, EnvironmentInjector, inject } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { triangle, ellipse, square, close, barChartOutline, shareOutline } from 'ionicons/icons';
import { NotificacaoService } from '../services/notificacao.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonBadge],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  notificacaoService = inject(NotificacaoService);

  constructor() {
    addIcons({ triangle, ellipse, square, close, barChartOutline, shareOutline });
  }
}
