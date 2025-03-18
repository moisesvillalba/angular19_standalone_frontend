// src/app/core/auth/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

// Definir el interceptor como una función de interceptor HTTP
export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  
  // Obtener token de localStorage
  const token = localStorage.getItem('token');
  
  if (token) {
    // Clonar la solicitud y añadir el token en el encabezado
    const authRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Continuar con la solicitud modificada
    return next(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si recibimos un 401 Unauthorized, el token ha expirado o es inválido
        if (error.status === 401) {
          // Limpiar datos de autenticación
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          
          // Redirigir al login
          router.navigate(['/auth/login']);
        }
        
        return throwError(() => error);
      })
    );
  }
  
  // Si no hay token, continuar con la solicitud original
  return next(request);
};