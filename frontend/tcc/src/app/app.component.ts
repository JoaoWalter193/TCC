import { Component, inject, Injector } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { MenuComponent } from "./components/menu/menu.component";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, MenuComponent],
})
export class AppComponent {
  constructor() {
    inject(ThemeService);
    const authService = inject(AuthService);
    const platform = inject(Platform);
    const injector = inject(Injector);

    authService.checkAuth();

    platform.ready().then(() => {
      if (platform.is('capacitor')) {
        import('./services/push.service').then(m => {
          const push = injector.get(m.PushService);
          push.init();
        });
        import('./services/local-notification.service').then(m => {
          const localNotif = injector.get(m.LocalNotificationService);
          localNotif.init();
        });
      }
    });
  }
}
