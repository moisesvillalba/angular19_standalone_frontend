import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// Servicios e interfaces
import { AuthService } from '../../core/auth/services/auth.service';
import { User } from '../../core/auth/models/user.model';
import { SincronizacionService } from '../sincronizacion/services/sincronizacion.service';

// Modal de Sincronización
import { SincronizacionModalComponent } from '../sincronizacion/components/sincronizacion-modal/sincronizacion-modal.component';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    // Módulos necesarios para el componente
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <!-- Banner de advertencia si la sincronización no está configurada -->
    <div *ngIf="!configuracionSincronizacionCompleta" class="sync-config-banner">
      <div class="banner-content">
        <!-- Ícono de advertencia de sincronización -->
        <mat-icon class="warning-icon">sync_problem</mat-icon>
        
        <div class="banner-text">
          <h3>Configuración de Sincronización Pendiente</h3>
          <p>Por favor, configura tus datos de sincronización para acceder a todas las funcionalidades del Catálogo OPAC.</p>
        </div>
        
        <!-- Botón para abrir configuración de sincronización -->
        <button 
          mat-raised-button 
          color="primary" 
          (click)="abrirConfiguracionSync()">
          Configurar Ahora
        </button>
      </div>
    </div>

    <!-- Contenedor principal del dashboard -->
    <div class="dashboard-container">
      <h1>Bienvenido al Dashboard</h1>
      
      <!-- Tarjeta de información de usuario -->
      <mat-card *ngIf="user">
        <mat-card-header>
          <mat-card-title>Información del Usuario</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Detalles del usuario -->
          <p><strong>Nombre:</strong> {{ user.fullName || user.username }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Roles:</strong> {{ user.roles.join(', ') }}</p>
        </mat-card-content>
        
        <mat-card-actions>
          <!-- Botón para ir a configuración de sincronización -->
          <button 
            mat-raised-button 
            color="primary" 
            (click)="irASincronizacion()">
            Configuración de Sincronización
          </button>
          
          <!-- Botón para cerrar sesión -->
          <button 
            mat-raised-button 
            color="warn" 
            (click)="logout()">
            Cerrar Sesión
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    /* Estilos para el banner de sincronización pendiente */
    .sync-config-banner {
      background-color: #f0f4f8;
      padding: 1rem;
      margin-bottom: 1.5rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      animation: slideIn 0.5s ease-out;
    }

    /* Animación de entrada para el banner */
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Contenedor principal del dashboard */
    .dashboard-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    /* Diseño de acciones de la tarjeta */
    mat-card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  `]
})
export class DashboardComponent implements OnInit {
  // Propiedades del componente
  
  // Información del usuario actual
  user: User | null = null;
  
  // Estado de configuración de sincronización
  configuracionSincronizacionCompleta = false;
  
  constructor(
    // Inyección de servicios necesarios
    private authService: AuthService,     // Servicio de autenticación
    private router: Router,               // Enrutador para navegación
    private dialog: MatDialog,            // Diálogo para modal de configuración
    private sincronizacionService: SincronizacionService  // Servicio de sincronización
  ) {
    // Obtener usuario actual al inicializar el componente
    this.user = this.authService.currentUserValue;
  }

  /**
   * Método de inicialización del componente
   * Se ejecuta después de la construcción del componente
   */
  ngOnInit(): void {
    // Verificar el estado de configuración de sincronización
    this.verificarConfiguracionSincronizacion();
  }
  
  /**
   * Verifica si la configuración de sincronización está completa
   * Consulta al servicio de sincronización para obtener el estado
   */
  verificarConfiguracionSincronizacion(): void {
    this.sincronizacionService.obtenerConfiguracion().subscribe({
      next: (config) => {
        // Validar que la configuración tenga todos los datos necesarios
        this.configuracionSincronizacionCompleta = 
          !!config && 
          !!config.servidor && 
          !!config.usuario && 
          !!config.rutaBaseDatos;
      },
      error: () => {
        // En caso de error, asumir que la configuración no está completa
        this.configuracionSincronizacionCompleta = false;
      }
    });
  }

  /**
   * Abre el modal de configuración de sincronización
   * Permite al usuario configurar los parámetros de sincronización
   */
  abrirConfiguracionSync(): void {
    // Abrir modal de configuración
    const dialogRef = this.dialog.open(SincronizacionModalComponent, {
      width: '500px',         // Ancho del modal
      maxWidth: '95vw',       // Ancho máximo responsivo
      disableClose: true      // No se puede cerrar haciendo clic fuera
    });

    // Manejar el resultado del modal
    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        // Si se guardó la configuración, recargar el estado
        this.verificarConfiguracionSincronizacion();
      }
    });
  }

  /**
   * Navega directamente a la página de configuración de sincronización
   */
  irASincronizacion(): void {
    this.router.navigate(['/sincronizacion']);
  }
  
  /**
   * Cierra la sesión del usuario actual
   * Redirige a la página de inicio de sesión
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}