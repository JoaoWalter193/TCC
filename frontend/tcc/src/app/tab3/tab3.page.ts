import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton,
  IonMenuButton, IonButtons, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonChip, IonLabel,
  IonItem, IonAvatar, IonText, IonList, IonBadge,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { NotificacaoService } from '../services/notificacao.service';
import { VereadorService } from '../services/vereador';
import { NotificacaoViewModel } from '../models/dto/notificacao-dto';
import { CommonModule } from '@angular/common';
import { MenuPanelComponent } from '../components/menu-panel/menu-panel.component';
import { VereadorTableComponent } from '../components/vereador-table/vereador-table.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton,
    IonMenuButton, IonButtons, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonChip, IonLabel,
    IonItem, IonAvatar, IonText, IonList, IonBadge,
    MenuPanelComponent,
    VereadorTableComponent,
  ],
})
export class Tab3Page implements OnInit, OnDestroy {
  private router = inject(Router);
  auth = inject(AuthService);
  notificacaoService = inject(NotificacaoService);
  private vereadorService = inject(VereadorService);

  private vereadorMap = new Map<string, number>();
  carregando = true;

  ngOnInit(): void {
    this.notificacaoService.setEstaNaPagina(true);
    this.carregarDados();
  }

  ngOnDestroy(): void {
    this.notificacaoService.setEstaNaPagina(false);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  get notificacoes(): NotificacaoViewModel[] {
    return this.notificacaoService.notificacoesSig();
  }

  get naoLidas(): number {
    return this.notificacaoService.naoLidasSig();
  }

  get temNaoLidas(): boolean {
    return this.naoLidas > 0;
  }

  get todasLidas(): boolean {
    return this.notificacoes.length > 0 && !this.temNaoLidas;
  }

  marcarTodas(): void {
    this.notificacaoService.marcarTodasComoLidas();
  }

  clicarNotificacao(n: NotificacaoViewModel): void {
    this.notificacaoService.marcarComoLida(n.id);

    if (n.proposicaoCodigo) {
      this.router.navigate(['/proposicao', n.proposicaoCodigo]);
    } else if (n.tipo === 'vereador' && n.vereadorNome) {
      const id = this.vereadorMap.get(n.vereadorNome.toLowerCase());
      if (id) {
        this.router.navigate(['/vereador', id]);
      }
    }
  }

  private carregarDados(): void {
    this.vereadorService.listar().pipe(
      catchError(() => of([])),
    ).subscribe(vereadores => {
      vereadores.forEach(v =>
        this.vereadorMap.set(v.nome.toLowerCase(), v.id),
      );

      const userInfo = localStorage.getItem('user_info');
      if (userInfo) {
        const storedId = localStorage.getItem('usuario_id');
        this.notificacaoService.carregarNotificacoes(
          storedId ? Number(storedId) : 1,
        );
      }
      this.carregando = false;
    });
  }
}
