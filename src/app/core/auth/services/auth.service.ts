// src/app/core/auth/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User, Role } from '../models/user.model';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // URL base de la API (en producción)
  private apiUrl = environment.apiUrl;
  
  // Modo de desarrollo para permitir login sin backend
  private devMode = true; // Cambiar a false en producción

  constructor(private http: HttpClient) {
    // Inicializar usuario desde localStorage al arrancar la aplicación
    this.loadStoredUser();
  }
  
  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  // Obtener el usuario actual sin suscripción
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Iniciar sesión
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Modo desarrollo: Usar usuarios de prueba sin backend
    if (this.devMode) {
      return this.mockLogin(credentials);
    }
    
    // Modo producción: Llamar a la API real
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => new Error(
            error.status === 401 ? 'Usuario o contraseña incorrectos' : 'Error en el servidor'
          ));
        })
      );
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  // Verificar si el usuario tiene un rol específico
  hasRole(role: Role): boolean {
    const user = this.currentUserValue;
    return !!user && user.roles.includes(role);
  }

  // Mock para desarrollo sin backend
  private mockLogin(credentials: LoginRequest): Observable<LoginResponse> {
    // Usuarios de prueba predefinidos
    const testUsers = {
      // Usuario normal
      user: {
        username: 'user',
        password: 'password',
        user: {
          id: 1,
          username: 'user',
          email: 'user@example.com',
          fullName: 'Usuario Normal',
          roles: [Role.USER]
        }
      },
      // Bibliotecario
      librarian: {
        username: 'librarian',
        password: 'password',
        user: {
          id: 2,
          username: 'librarian',
          email: 'librarian@example.com',
          fullName: 'Bibliotecario de Prueba',
          roles: [Role.USER, Role.LIBRARIAN]
        }
      },
      // Administrador
      admin: {
        username: 'admin',
        password: 'password',
        user: {
          id: 3,
          username: 'admin',
          email: 'admin@example.com',
          fullName: 'Administrador del Sistema',
          roles: [Role.USER, Role.LIBRARIAN, Role.ADMIN]
        }
      }
    };

    // Buscar usuario por nombre de usuario
    const foundUser = Object.values(testUsers).find(
      user => user.username === credentials.username && user.password === credentials.password
    );

    if (foundUser) {
      // Simular retraso de red (500ms)
      return of({
        user: foundUser.user,
        token: 'mock-jwt-token'
      }).pipe(
        tap(response => this.handleAuthentication(response)),
        // Simular retraso de red
        tap(() => new Promise(resolve => setTimeout(resolve, 500)))
      );
    }

    // Usuario no encontrado
    return throwError(() => new Error('Usuario o contraseña incorrectos'));
  }

  // Procesar respuesta de autenticación
  private handleAuthentication(response: LoginResponse): void {
    const { user, token } = response;
    
    // Guardar en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Actualizar BehaviorSubject
    this.currentUserSubject.next(user);
  }
}