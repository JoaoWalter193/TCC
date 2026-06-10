import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonButtons, IonBackButton, IonMenuButton, IonHeader, IonList, IonItem, IonIcon, IonLabel, IonToolbar } from '@ionic/angular/standalone';
import { DashboardMode } from '../services/dashboard-mode';
import { UsuarioDTO } from '../models/dto/usuario-dto';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  imports: [ IonContent, IonButtons, IonBackButton, IonMenuButton, IonHeader, IonList, IonItem, RouterLink, IonIcon, IonLabel, IonToolbar ],
})
export class PerfilComponent implements OnInit {
  usuario: UsuarioDTO = { cpf: '', nome: '', email: '', cep: null, escolaridade: null, profissao: null };

  constructor(private modoService: DashboardMode, private router: Router) {}

  ngOnInit() {
    this.carregarDados();
  }

  private carregarDados() {
    const raw = localStorage.getItem('user_info');
    if (raw) {
      try {
        this.usuario = JSON.parse(raw);
      } catch {}
    }
  }

  navMeusDashboards() {
    this.modoService.setModo('my-dashboard');
    this.router.navigate(['tabs/tab6']);
  }

  navEditarPerfil() {
    this.router.navigate(['/tabs/tab1']);
  }
}
