import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('../tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: 'notificacoes',
        loadComponent: () =>
          import('../tab3/tab3.page').then((m) => m.Tab3Page),
      },
      {
        path: 'pesquisa',
        loadComponent: () =>
          import('../tab4/tab4.page').then((m) => m.Tab4Page),
      },
      {
        path: 'acompanhamento',
        loadComponent: () =>
          import('../tab5/tab5.page').then((m) => m.Tab5Page),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../tab6/tab6.page').then((m) => m.Tab6Page),
      },
      {
        path: 'tab2',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
      {
        path: 'tab3',
        redirectTo: '/tabs/notificacoes',
        pathMatch: 'full',
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
];
