// src/app/core/auth/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

// Guard simple para verificar autenticación
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Redirigir al login guardando la URL actual
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
};

// Guard avanzado para verificar roles específicos
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Primero verificar autenticación
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
  
  // Obtener roles requeridos de la ruta
  const requiredRoles = route.data['roles'] as Role[];
  
  // Si no hay roles requeridos, permitir acceso
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  
  // Verificar si el usuario tiene al menos uno de los roles requeridos
  const hasRequiredRole = requiredRoles.some(role => authService.hasRole(role));
  
  if (hasRequiredRole) {
    return true;
  }
  
  // Usuario no tiene los roles necesarios, redirigir a página de acceso denegado
  return router.createUrlTree(['/access-denied']);
};