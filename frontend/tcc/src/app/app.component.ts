import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { MenuComponent } from "./components/menu/menu.component";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, MenuComponent],
})
export class AppComponent {
  constructor() {
    inject(AuthService).checkAuth();

    const platform = inject(Platform);
    platform.ready().then(() => {
      if (platform.is('capacitor')) {
        import('./services/push.service').then(m => {
          const push = inject(m.PushService);
          push.init();
        });
        import('./services/local-notification.service').then(m => {
          const localNotif = inject(m.LocalNotificationService);
          localNotif.init();
        });
      }
    });
  }
}
