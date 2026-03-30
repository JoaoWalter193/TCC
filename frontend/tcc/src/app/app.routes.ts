import { RecoverComponent } from './recover/recover.component';
import { Routes } from '@angular/router';

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
        path: 'tab4',
        loadComponent: () => import('./tab4/tab4.page').then((m) => m.Tab4Page),
      },
      {
        path: 'tab5',
        loadComponent: () => import('./tab5/tab5.page').then((m) => m.Tab5Page),
      },
      {
        path: 'tab6',
        loadComponent: () => import('./tab6/tab6.page').then((m) => m.Tab6Page),
      },
    ],
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./perfil/perfil.component').then((m) => m.PerfilComponent),
  },
  {
    path: 'historico',
    loadComponent: () =>
      import('./historico/historico.component').then(
        (m) => m.HistoricoComponent,
      ),
  },
  {
    path: 'configuracoes',
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
  }
];
