import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/auth/services/auth.service';
import { User } from '../../core/auth/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Bienvenido al Dashboard</h1>
      
      <mat-card *ngIf="user">
        <mat-card-header>
          <mat-card-title>Información del Usuario</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p><strong>Nombre:</strong> {{ user.fullName || user.username }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Roles:</strong> {{ user.roles.join(', ') }}</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="warn" (click)="logout()">Cerrar Sesión</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    
    h1 {
      margin-bottom: 2rem;
      color: #3f51b5;
    }
    
    mat-card {
      margin-bottom: 1rem;
    }
  `]
})
export class DashboardComponent {
  user: User | null = null;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.currentUserValue;
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}