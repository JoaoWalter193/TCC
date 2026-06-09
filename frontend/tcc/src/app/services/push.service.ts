import { Injectable, inject } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';
import { ApiGatewayService } from './api-gateway.service';
import { Router } from '@angular/router';
import { NotificacaoService } from './notificacao.service';
import type { PushNotificationsPlugin } from '@capacitor/push-notifications';

@Injectable({ providedIn: 'root' })
export class PushService {
  private api = inject(ApiGatewayService);
  private router = inject(Router);
  private notificacaoService = inject(NotificacaoService);
  private PushNotifications?: PushNotificationsPlugin;

  async init(): Promise<void> {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    this.PushNotifications = PushNotifications;

    await PushNotifications.requestPermissions();
    await PushNotifications.register();

    PushNotifications.addListener('registration', (token) => {
      this.enviarTokenParaBackend(token.value);
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Erro FCM:', err);
    });

    PushNotifications.addListener('pushNotificationReceived', (notif) => {
      this.notificacaoService.carregarNotificacoes(
        Number(localStorage.getItem('usuario_id') || 1),
      );
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const data = action.notification.data;
      if (data?.proposicaoCodigo) {
        this.router.navigate(['/proposicao', data.proposicaoCodigo]);
      } else if (data?.rota) {
        this.router.navigate([data.rota]);
      }
    });
  }

  private enviarTokenParaBackend(fcmToken: string): void {
    const usuarioId = localStorage.getItem('usuario_id');
    if (!usuarioId) return;

    this.api.v1.post('/dispositivos', {
      usuarioId: Number(usuarioId),
      fcmToken,
    }).subscribe();
  }
}
