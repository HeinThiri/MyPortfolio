import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home, title: 'Hein Thiri Htun — Frontend Developer' },
  {
    path: 'work/:slug',
    loadComponent: () => import('./pages/project-detail/project-detail').then((m) => m.ProjectDetail),
  },
  { path: '**', redirectTo: '' },
];
