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
  
  // Método para establecer la institución y filial activa con la que trabaja el usuario
  setActiveInstitutionAndBranch(institucionId: string, filialId: string): void {
    const currentUser = this.currentUserValue;
    
    if (currentUser) {
      // Verificar que el usuario tenga acceso a la institución y filial
      const esAdmin = this.hasRole(Role.ADMIN);
      
      // Para usuarios normales, verificar permisos específicos
      const tieneAccesoFilial = esAdmin || 
                               (currentUser.filialesIds && 
                                currentUser.filialesIds.includes(filialId));
      
      // Para la institución, verificar tanto institucionId como el array de institucionesIds
      const tieneAccesoInstitucion = esAdmin || 
                                    (currentUser.institucionId === institucionId) || 
                                    (currentUser.institucionesIds && 
                                     currentUser.institucionesIds.includes(institucionId));
      
      if (tieneAccesoInstitucion && tieneAccesoFilial) {
        // Crear una copia del usuario con las nuevas selecciones
        const updatedUser: User = {
          ...currentUser,
          institucionActiva: institucionId,
          filialActiva: filialId
        };
        
        // Guardar en localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Actualizar el BehaviorSubject
        this.currentUserSubject.next(updatedUser);
        return;
      }
    }
    
    // Si llegamos aquí, hubo un error (usuario no tiene acceso)
    console.error('El usuario no tiene acceso a la institución o filial seleccionada');
  }

  // Método para simular diferentes perfiles de usuario para pruebas
  simulateUserProfile(profile: 'single_filial' | 'multiple_filiales' | 'multi_biblioteca' | 'admin'): void {
    let testUser: User;
    
    switch(profile) {
      case 'single_filial':
        testUser = {
          id: '123',
          username: 'usuario_regular',
          fullName: 'Usuario Regular',
          email: 'usuario@test.com',
          roles: [Role.USER],
          institucionId: 'universidad',
          filialesIds: ['medicina'],
          // Usuario con una sola institución y filial, ya preseleccionada
          institucionActiva: 'universidad',
          filialActiva: 'medicina'
        };
        break;
        
      case 'multiple_filiales':
        testUser = {
          id: '456',
          username: 'usuario_multi',
          fullName: 'Usuario Multi-Filial',
          email: 'multi@test.com',
          roles: [Role.USER],
          institucionId: 'universidad',
          // Agregar soporte para múltiples instituciones
          institucionesIds: ['universidad'],
          filialesIds: ['medicina', 'derecho', 'arquitectura']
          // No selección activa, para forzar la elección
        };
        break;
        
      case 'multi_biblioteca':
        testUser = {
          id: '567',
          username: 'multi_biblioteca',
          fullName: 'Usuario Multi-Biblioteca',
          email: 'multi_bib@test.com',
          roles: [Role.USER, Role.LIBRARIAN],
          // Pertenece a múltiples instituciones
          institucionesIds: ['universidad', 'bibliotecas_municipales'],
          filialesIds: ['medicina', 'biblioteca_central', 'biblioteca_sur']
          // No selección activa, para forzar la elección
        };
        break;
        
      case 'admin':
        testUser = {
          id: '789',
          username: 'admin_user',
          fullName: 'Administrador',
          email: 'admin@test.com',
          roles: [Role.ADMIN, Role.USER, Role.LIBRARIAN],
          // Los admins pueden acceder a cualquier institución/filial
          institucionId: 'universidad',
          institucionesIds: ['universidad', 'bibliotecas_municipales', 'colegios'],
          filialesIds: ['agronomia', 'medicina', 'derecho', 'biblioteca_central']
        };
        break;
        
      default:
        testUser = {
          id: '123',
          username: 'usuario_regular',
          fullName: 'Usuario Regular',
          email: 'usuario@test.com',
          roles: [Role.USER],
          institucionId: 'universidad',
          filialesIds: ['medicina'],
          institucionActiva: 'universidad',
          filialActiva: 'medicina'
        };
    }
    
    // Guardar en localStorage
    localStorage.setItem('currentUser', JSON.stringify(testUser));
    // Actualizar el BehaviorSubject
    this.currentUserSubject.next(testUser);
  }

  // Mock para desarrollo sin backend
  private mockLogin(credentials: LoginRequest): Observable<LoginResponse> {
    // Usuarios de prueba predefinidos con información de institución y filiales
    const testUsers = {
      // Usuario normal con una filial
      user: {
        username: 'user',
        password: 'password',
        user: {
          id: '1',
          username: 'user',
          email: 'user@example.com',
          fullName: 'Usuario Normal',
          roles: [Role.USER],
          // Información de institución y filial
          institucionId: 'universidad',
          institucionesIds: ['universidad'],
          filialesIds: ['medicina'],
          institucionActiva: 'universidad',
          filialActiva: 'medicina'
        }
      },
      // Bibliotecario con múltiples filiales
      librarian: {
        username: 'librarian',
        password: 'password',
        user: {
          id: '2',
          username: 'librarian',
          email: 'librarian@example.com',
          fullName: 'Bibliotecario de Prueba',
          roles: [Role.USER, Role.LIBRARIAN],
          // Múltiples filiales de la misma institución
          institucionId: 'universidad',
          institucionesIds: ['universidad'],
          filialesIds: ['medicina', 'derecho', 'arquitectura']
          // Sin institución/filial activa, para forzar la selección
        }
      },
      // Usuario con múltiples bibliotecas
      multi: {
        username: 'multi',
        password: 'password',
        user: {
          id: '4',
          username: 'multi',
          email: 'multi@example.com',
          fullName: 'Usuario Multi-Biblioteca',
          roles: [Role.USER, Role.LIBRARIAN],
          // Múltiples instituciones y filiales
          institucionesIds: ['universidad', 'bibliotecas_municipales'],
          filialesIds: ['arquitectura', 'biblioteca_central', 'biblioteca_sur']
          // Sin institución/filial activa, para forzar la selección
        }
      },
      // Administrador con acceso completo
      admin: {
        username: 'admin',
        password: 'password',
        user: {
          id: '3',
          username: 'admin',
          email: 'admin@example.com',
          fullName: 'Administrador del Sistema',
          roles: [Role.USER, Role.LIBRARIAN, Role.ADMIN],
          // Los admins pueden acceder a cualquier institución/filial
          institucionId: 'biblioteca_externa',
          institucionesIds: ['universidad', 'bibliotecas_municipales', 'colegios', 'biblioteca_externa'],
          filialesIds: ['biblioteca_central', 'biblioteca_sur', 'medicina', 'arquitectura']
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