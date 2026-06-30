import { Injectable, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';

interface LocalNotificationsPlugin {
  requestPermissions(): Promise<{ display: string }>;
  schedule(options: { notifications: Array<{
    id: number; title: string; body: string; extra?: Record<string, unknown>;
    schedule?: { at: Date }; smallIcon?: string; iconColor?: string;
    channelId?: string;
  }> }): Promise<void>;
  cancel(options: { notifications: Array<{ id: number }> }): Promise<void>;
  addListener(eventName: string, callback: (data: any) => void): Promise<unknown>;
  createChannel(channel: {
    id: string;
    name: string;
    description?: string;
    importance?: 1 | 2 | 3 | 4 | 5;
    vibration?: boolean;
    lights?: boolean;
  }): Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class LocalNotificationService {
  private router = inject(Router);
  private zone = inject(NgZone);
  private plugin?: LocalNotificationsPlugin;

  async init(): Promise<void> {
    try {
      const mod = await import('@capacitor/local-notifications');
      this.plugin = (mod.LocalNotifications as unknown) as LocalNotificationsPlugin;

      const perm = await this.plugin.requestPermissions();
      if (perm.display !== 'granted') return;

      await this.plugin.createChannel({
        id: 'push_notifications',
        name: 'Notificações',
        description: 'Notificações do Curitiba Ativa',
        importance: 5,
        vibration: true,
        lights: true,
      });

      await this.plugin.addListener('localNotificationActionPerformed', (action) => {
        const extra = action.notification.extra ?? {};
        this.zone.run(() => {
          if (extra['proposicaoCodigo'] && extra['proposicaoCodigo'] !== -1) {
            this.router.navigate(['/proposicao', extra['proposicaoCodigo']]);
          } else {
            this.router.navigate(['/tabs/notificacoes']);
          }
        });
      });
    } catch {
      console.warn('@capacitor/local-notifications não disponível');
    }
  }

  async agendar(
    id: number,
    titulo: string,
    mensagem: string,
    extra?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.plugin) return;
    await this.plugin.schedule({
      notifications: [
        {
          id,
          title: titulo,
          body: mensagem,
          extra: extra ?? {},
          schedule: { at: new Date(Date.now() + 1000) },
          iconColor: '#3880ff',
          smallIcon: 'ic_notification',
          channelId: 'push_notifications',
        },
      ],
    });
  }

  async cancelar(id: number): Promise<void> {
    if (!this.plugin) return;
    await this.plugin.cancel({ notifications: [{ id }] });
  }

  async cancelarTodas(): Promise<void> {
    if (!this.plugin) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const { notifications } = await LocalNotifications.getPending();
      if (notifications.length > 0) {
        await LocalNotifications.cancel({ notifications });
      }
    } catch {
      console.warn('Erro ao cancelar notificações locais');
    }
  }
}
