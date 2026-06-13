import { Injectable, signal, inject } from "@angular/core";
import { ModalController } from "@ionic/angular/standalone";
import { Router } from "@angular/router";
import { LoginPromptComponent } from "../components/login-prompt/login-prompt.component";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private loggedIn = signal(false);
    private modalCtrl = inject(ModalController);
    private router = inject(Router);

    isLoggedIn = this.loggedIn.asReadonly();

    checkAuth(): Promise<void> {
        return new Promise(resolve => {
            const token = localStorage.getItem('auth_token');
            this.loggedIn.set(!!token);
            resolve();
        })
    }

    getUsuarioId(): number | null {
        const id = localStorage.getItem('usuario_id');
        return id ? Number(id) : null;
    }

    logout(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('usuario_id');
        this.loggedIn.set(false);
    }

    async showLoginPrompt(): Promise<void> {
        const modal = await this.modalCtrl.create({
            component: LoginPromptComponent,
            cssClass: 'login-prompt-modal',
        });
        await modal.present();
    }
}
