import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular/standalone';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login-prompt',
  templateUrl: './login-prompt.component.html',
  styleUrls: ['./login-prompt.component.scss'],
  standalone: true,
  imports: [IonButton, IonIcon],
})
export class LoginPromptComponent {
  private modalCtrl = inject(ModalController);
  private router = inject(Router);

  dismiss() {
    this.modalCtrl.dismiss();
  }

  fazerLogin() {
    this.modalCtrl.dismiss();
    this.router.navigate(['/login']);
  }
}
