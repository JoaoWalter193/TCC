import { Injectable, inject } from '@angular/core';
import { ApiGatewayService } from './api-gateway.service';
import { Router } from '@angular/router';
import { NotificacaoService } from './notificacao.service';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { PushNotificationsPlugin } from '@capacitor/push-notifications';

@Injectable({ providedIn: 'root' })
export class PushService {
  private api = inject(ApiGatewayService);
  private router = inject(Router);
  private notificacaoService = inject(NotificacaoService);
  private PushNotifications?: PushNotificationsPlugin;
  private fcmToken: string | null = null;

  async init(): Promise<void> {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    this.PushNotifications = PushNotifications;

    PushNotifications.addListener('registration', (token) => {
      this.fcmToken = token.value;
      this.tentarRegistrarBackend();
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Erro FCM:', err);
    });

    PushNotifications.addListener('pushNotificationReceived', (notif) => {
      this.notificacaoService.carregarNotificacoes(
        Number(localStorage.getItem('usuario_id') || 1),
      );
      const localId = Math.floor(Date.now() % 1000000) + Math.floor(Math.random() * 1000);
      LocalNotifications.schedule({
        notifications: [{
          title: notif.title ?? 'Curitiba Ativa',
          body: notif.body ?? '',
          id: localId,
          schedule: { at: new Date() },
          smallIcon: 'ic_notification',
          channelId: 'push_notifications',
        }],
      });
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const data = action.notification.data;
      if (data?.proposicaoCodigo) {
        this.router.navigate(['/proposicao', data.proposicaoCodigo]);
      } else if (data?.rota) {
        this.router.navigate([data.rota]);
      }
    });

    await PushNotifications.requestPermissions();
    await PushNotifications.register();
  }

  tentarRegistrarBackend(): void {
    const usuarioId = localStorage.getItem('usuario_id');
    if (!this.fcmToken || !usuarioId) return;

    this.api.v1.post('/dispositivos', {
      usuarioId: Number(usuarioId),
      fcmToken: this.fcmToken,
    }).subscribe({
      error: (err) => console.error('Erro ao registrar FCM no backend:', err),
    });
  }
}
