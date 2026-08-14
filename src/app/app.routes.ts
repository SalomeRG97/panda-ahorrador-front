import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Rutas públicas
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },

  // Rutas protegidas (todos los usuarios autenticados)
  { path: '', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent), canActivate: [authGuard] },
  { path: 'years', loadComponent: () => import('./features/years/year-list/year-list.component').then(m => m.YearListComponent), canActivate: [authGuard] },
  { path: 'years/:yearId', loadComponent: () => import('./features/years/year-dashboard/year-dashboard.component').then(m => m.YearDashboardComponent), canActivate: [authGuard] },
  { path: 'years/:yearId/months/:monthId', loadComponent: () => import('./features/months/month-layout/month-layout.component').then(m => m.MonthLayoutComponent), canActivate: [authGuard] },
  { path: 'years/:yearId/months/:monthId/weeks/:weekId', loadComponent: () => import('./features/weeks/week-detail/week-detail.component').then(m => m.WeekDetailComponent), canActivate: [authGuard] },
  { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent), canActivate: [authGuard] },
  { path: 'share', loadComponent: () => import('./features/share/share-management/share-management.component').then(m => m.ShareManagementComponent), canActivate: [authGuard] },

  // Ruta protegida por ROL (Admin)
  { 
    path: 'admin', 
    loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent), 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ['admin'] } 
  },

  { path: '**', redirectTo: 'years' }
];

