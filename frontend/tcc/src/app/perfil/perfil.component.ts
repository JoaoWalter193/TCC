import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonButtons, IonBackButton, IonMenuButton, IonHeader, IonList, IonItem, IonIcon, IonLabel, IonToolbar } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { DashboardMode } from '../services/dashboard-mode';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioPerfilDTO } from '../models/dto/usuario-perfil-dto';
import { PushService } from '../services/push.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  imports: [ CommonModule, IonContent, IonButtons, IonBackButton, IonMenuButton, IonHeader, IonList, IonItem, RouterLink, IonIcon, IonLabel, IonToolbar ],
})
export class PerfilComponent implements OnInit {
  perfil: UsuarioPerfilDTO | null = null;
  carregando = true;

  constructor(
    private modoService: DashboardMode,
    private router: Router,
    private usuarioService: UsuarioService,
    private pushService: PushService,
  ) {}

  ngOnInit() {
    this.carregarPerfil();
  }

  private carregarPerfil() {
    const raw = localStorage.getItem('user_info');
    if (!raw) {
      this.router.navigate(['/login']);
      return;
    }
    const parsed = JSON.parse(raw);
    const cpf = parsed.cpf;
    this.usuarioService.pegarPerfil(cpf).subscribe({
      next: (data) => {
        this.perfil = data;
        localStorage.setItem('user_info', JSON.stringify(data));
        localStorage.setItem('usuario_id', String(data.id));
        this.pushService.tentarRegistrarBackend();
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
        if (err.status === 401 || err.status === 403) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_info');
          this.router.navigate(['/login']);
          return;
        }
        this.carregando = false;
      },
    });
  }

  navMeusDashboards() {
    this.modoService.setModo('my-dashboard');
    this.router.navigate(['tabs/tab6']);
  }

  navEditarPerfil() {
    this.router.navigate(['/tabs/tab1']);
  }

  navFavoritos() {
    this.router.navigate(['/tabs/tab5']);
  }

  navSeguindo() {
    this.router.navigate(['/seguindo']);
  }
}
