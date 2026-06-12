import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonHeader, IonButtons, IonBackButton, IonMenuButton, IonContent, IonItem, IonList, IonToggle, IonButton, IonToolbar, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

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
    RouterLink,
    IonToolbar,
    IonIcon,
    IonLabel
],
})
export class ConfiguracoesComponent implements OnInit {
  paletteToggle: boolean = false;
  notifyToggle: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {}

  sair() {
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  toggleChange(event: CustomEvent) {}

  toggleNotify(event: CustomEvent) {}
}
