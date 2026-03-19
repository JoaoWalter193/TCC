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
}
