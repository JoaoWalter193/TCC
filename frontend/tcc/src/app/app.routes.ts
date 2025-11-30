import { RecoverComponent } from './recover/recover.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./cadastro/cadastro.component').then((m) => m.CadastroComponent),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },

  {
    path: 'recover',
    loadComponent: () =>
      import('./recover/recover.component').then((m) => m.RecoverComponent),
  },

  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
];
