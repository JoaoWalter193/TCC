import { Component, inject, Injector, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { MenuComponent } from "./components/menu/menu.component";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, MenuComponent],
})
export class AppComponent implements OnDestroy {
  private destroyed = new Subject<void>();

  constructor() {
    inject(ThemeService);
    const authService = inject(AuthService);
    const platform = inject(Platform);
    const router = inject(Router);
    const injector = inject(Injector);

    authService.checkAuth();

    authService.authState$
      .pipe(takeUntil(this.destroyed))
      .subscribe((isLoggedIn) => {
        if (!isLoggedIn) {
          const protectedPrefixes = ['/perfil', '/historico', '/configuracoes', '/editar-perfil'];
          const rotaAtual = router.url.split('?')[0];
          if (protectedPrefixes.some(p => rotaAtual.startsWith(p))) {
            router.navigate(['/tabs/home'], { replaceUrl: true });
          }
        }
      });

    platform.backButton.subscribeWithPriority(0, () => {
      router.navigate(['/tabs/home']);
    });

    platform.ready().then(() => {
      if (platform.is('capacitor')) {
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setBackgroundColor({ color: '#1DA1F2' });

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

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
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
