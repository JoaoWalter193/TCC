import { Component, inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
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
    const router = inject(Router);
    const injector = inject(Injector);

    authService.checkAuth();

    platform.backButton.subscribeWithPriority(0, () => {
      router.navigate(['/tabs/tab2']);
    });

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

        if (platform.is('android')) {
          this.aplicarSafeAreaAndroid();
        }
      }
    });
  }

  private aplicarSafeAreaAndroid(): void {
    const setInset = (px: number) => {
      document.documentElement.style.setProperty('--safe-inset-bottom', `${px}px`);
    };

    if (!window.visualViewport) {
      setInset(48);
      return;
    }

    const vv = window.visualViewport!;
    const measured = Math.max(0, window.innerHeight - vv.height);

    if (measured > 2) {
      setInset(measured);
    } else {
      setInset(48);
    }
  }
}
