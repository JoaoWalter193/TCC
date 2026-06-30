import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },

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
    path: 'tabs',
    children: [
      {
        path: 'pesquisa',
        loadComponent: () => import('./tab4/tab4.page').then((m) => m.Tab4Page),
      },
      {
        path: 'acompanhamento',
        loadComponent: () => import('./tab5/tab5.page').then((m) => m.Tab5Page),
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./tab6/tab6.page').then((m) => m.Tab6Page),
      },
      {
        path: 'tab4',
        redirectTo: '/tabs/pesquisa',
        pathMatch: 'full',
      },
      {
        path: 'tab5',
        redirectTo: '/tabs/acompanhamento',
        pathMatch: 'full',
      },
      {
        path: 'tab6',
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./perfil/perfil.component').then((m) => m.PerfilComponent),
  },
  {
    path: 'seguindo',
    redirectTo: '/tabs/acompanhamento',
    pathMatch: 'full',
  },
  {
    path: 'historico',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./historico/historico.component').then(
        (m) => m.HistoricoComponent,
      ),
  },
  {
    path: 'configuracoes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./configuracoes/configuracoes.component').then(
        (m) => m.ConfiguracoesComponent,
      ),
  },
  {
    path: 'proposicao/:id',
    loadComponent: () =>
      import('./post/post.component').then((m) => m.PostComponent)
  },
  {
    path: 'vereador/:id',
    loadComponent: () =>
      import('./vereador/vereador.component').then((m) => m.VereadorComponent)
  },
  {
    path: 'editar-perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tab1/tab1.page').then((m) => m.Tab1Page),
  },
];
