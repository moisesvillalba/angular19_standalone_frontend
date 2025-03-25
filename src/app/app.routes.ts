import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
// app.routes.ts

/**
 * Configuración de rutas de la aplicación OPAC
 * 
 * Características:
 * - Rutas protegidas con guards de autenticación
 * - Carga perezosa de componentes
 * - Redirecciones por defecto
 */
export const routes: Routes = [
  // Redirige a la página de login por defecto
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  // Rutas de autenticación
  {
    path: 'auth',
    children: [
      // Página de login
      {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login/login.component')
          .then(m => m.LoginComponent),
        title: 'Iniciar Sesión - OPAC'
      }
    ]
  },
  // Ruta de dashboard protegida
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard - OPAC'
  },
  // Nueva ruta de sincronización
  {
    path: 'sincronizacion',
    loadComponent: () => import('./features/sincronizacion/components/sincronizacion-configuracion.component')
      .then(m => m.SincronizacionConfiguracionComponent),
    canActivate: [authGuard], // Protección con guard de autenticación
    title: 'Configuración de Sincronización - OPAC'
  },
  // Ruta comodín para manejar rutas no encontradas
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];