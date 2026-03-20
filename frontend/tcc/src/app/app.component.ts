import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { MenuComponent } from "./components/menu/menu.component";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, MenuComponent],
})
export class AppComponent {
  constructor(private authService: AuthService) {
    this.authService.checkAuth();
  }
}
