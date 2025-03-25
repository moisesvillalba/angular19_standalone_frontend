import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { SincronizacionService } from '../../services/sincronizacion.service';
import { ConfiguracionSincronizacion } from '../../models/sincronizacion-config.model';

@Component({
  selector: 'app-sincronizacion-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>Configuración de Sincronización</h2>
    
    <mat-dialog-content>
      <form [formGroup]="configuracionForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Servidor</mat-label>
          <input matInput formControlName="servidor" placeholder="Dirección del servidor">
          <mat-error *ngIf="configuracionForm.get('servidor')?.hasError('required')">
            El servidor es requerido
          </mat-error>
          <mat-error *ngIf="configuracionForm.get('servidor')?.hasError('minlength')">
            Mínimo 3 caracteres
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Usuario</mat-label>
          <input matInput formControlName="usuario" placeholder="Nombre de usuario">
          <mat-error *ngIf="configuracionForm.get('usuario')?.hasError('required')">
            El usuario es requerido
          </mat-error>
          <mat-error *ngIf="configuracionForm.get('usuario')?.hasError('minlength')">
            Mínimo 3 caracteres
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Contraseña</mat-label>
          <input matInput formControlName="contrasena" type="password" placeholder="Contraseña">
          <mat-error *ngIf="configuracionForm.get('contrasena')?.hasError('required')">
            La contraseña es requerida
          </mat-error>
          <mat-error *ngIf="configuracionForm.get('contrasena')?.hasError('minlength')">
            Mínimo 4 caracteres
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Ruta Base de Datos</mat-label>
          <input matInput formControlName="rutaBaseDatos" placeholder="Ruta de la base de datos">
          <mat-error *ngIf="configuracionForm.get('rutaBaseDatos')?.hasError('required')">
            La ruta de la base de datos es requerida
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button 
        mat-raised-button 
        color="primary" 
        [disabled]="configuracionForm.invalid"
        (click)="guardar()">
        Guardar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    mat-dialog-content {
      min-width: 350px;
    }
  `]
})
export class SincronizacionModalComponent implements OnInit {
  configuracionForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<SincronizacionModalComponent>,
    private fb: FormBuilder,
    private sincronizacionService: SincronizacionService
  ) {
    // Inicializar el formulario en el constructor
    this.configuracionForm = this.fb.group({
      servidor: ['localhost', [Validators.required, Validators.minLength(3)]],
      usuario: ['SYSDBA', [Validators.required, Validators.minLength(3)]],
      contrasena: ['', [Validators.required, Validators.minLength(4)]],
      rutaBaseDatos: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Cargar la configuración existente si está disponible
    this.sincronizacionService.obtenerConfiguracion().subscribe({
      next: (config) => {
        if (config) {
          this.configuracionForm.patchValue({
            servidor: config.servidor || 'localhost',
            usuario: config.usuario || 'SYSDBA',
            rutaBaseDatos: config.rutaBaseDatos || ''
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar la configuración:', err);
      }
    });
  }

  guardar(): void {
    if (this.configuracionForm.valid) {
      const configuracion: ConfiguracionSincronizacion = {
        ...this.configuracionForm.value,
        ultimaSincronizacion: new Date()
      };
      
      this.sincronizacionService.guardarConfiguracion(configuracion).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error al guardar la configuración:', err);
          // Aquí se podría mostrar un mensaje de error al usuario
        }
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}