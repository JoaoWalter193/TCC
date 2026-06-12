import { Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private loggedIn = signal(false);

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
}
