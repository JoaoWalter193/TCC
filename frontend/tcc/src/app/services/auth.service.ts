import { Injectable, signal, inject } from "@angular/core";
import { ModalController } from "@ionic/angular/standalone";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject } from "rxjs";
import { LoginPromptComponent } from "../components/login-prompt/login-prompt.component";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private loggedIn = signal(false);
    private authState = new BehaviorSubject<boolean>(false);
    private appReset = new Subject<void>();
    private modalCtrl = inject(ModalController);
    private router = inject(Router);

    isLoggedIn = this.loggedIn.asReadonly();
    authState$ = this.authState.asObservable();
    reset$ = this.appReset.asObservable();

    /** Lê o localStorage e atualiza o estado de autenticação. */
    refreshAuthState(): void {
        const token = localStorage.getItem('auth_token');
        const authenticated = !!token;
        this.loggedIn.set(authenticated);
        this.authState.next(authenticated);
    }

    /** Usado como APP_INITIALIZER — delega para refreshAuthState. */
    checkAuth(): Promise<void> {
        this.refreshAuthState();
        return Promise.resolve();
    }

    /** Persiste token + dados do usuário e atualiza estado reativo. */
    saveAuthData(token: string, usuario: { id: number }): void {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_info', JSON.stringify(usuario));
        localStorage.setItem('usuario_id', String(usuario.id));
        this.refreshAuthState();
    }

    getUsuarioId(): number | null {
        const id = localStorage.getItem('usuario_id');
        return id ? Number(id) : null;
    }

    /** Limpa todos os dados, notifica reset global e redireciona. */
    logout(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('usuario_id');
        this.loggedIn.set(false);
        this.authState.next(false);
        this.appReset.next();
    }

    async showLoginPrompt(): Promise<void> {
        const modal = await this.modalCtrl.create({
            component: LoginPromptComponent,
            cssClass: 'login-prompt-modal',
        });
        await modal.present();
    }
}
