// src/app/features/sincronizacion/components/sincronizacion-configuracion.component.ts

import { Component, OnInit, isDevMode, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SincronizacionService } from '../services/sincronizacion.service';
import { ConfiguracionSincronizacion } from '../models/sincronizacion-config.model';
import { Institucion, Filial, TipoConexion } from '../models/institucion-filial.model';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Router } from '@angular/router';
import { User, Role } from '../../../core/auth/models/user.model';


@Component({
  selector: 'app-sincronizacion-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSelectModule,
    MatDividerModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './sincronizacion-configuracion.component.html',
  styleUrls: ['./sincronizacion-configuracion.component.scss']
})
export class SincronizacionConfiguracionComponent implements OnInit {
  configuracionForm: FormGroup;
  archivoSeleccionado: File | null = null;
  cargando = false;

  // Flag para verificar si el usuario actual es administrador
  esAdmin = false;

  // Usuario actual
  usuarioActual: User | null = null;

  // Flag para indicar si el usuario pertenece a múltiples filiales
  tieneMultiplesFiliales = false;

  // Acceso directo a enum para usar en la plantilla
  tipoConexion = TipoConexion;

  // Flag para verificar si estamos en modo desarrollo
  esModoDesarrollo = isDevMode();
  // Agregar este método en la clase SincronizacionConfiguracionComponent



  // En el componente TypeScript
  get institucionDeshabilitada(): boolean {
    // Si es administrador, nunca está deshabilitado
    if (this.esAdmin) return false;

    // Si no hay usuario actual, está deshabilitado
    if (!this.usuarioActual) return true;

    // Si el usuario tiene una institución asignada, deshabilitar la selección
    return !!this.usuarioActual.institucionId;
  }
  // Lista de instituciones disponibles
  instituciones: Institucion[] = [
    {
      id: 'universidad',
      nombre: 'Universidad Nacional',
      filiales: [
        {
          id: 'agronomia',
          nombre: 'Facultad de Agronomía',
          tipoConexion: TipoConexion.SERVIDOR_CENTRAL,
          servidor: 'sdb02',
          rutaBaseDatos: '/ruta/agronomia/db.fdb'
        },
        {
          id: 'arquitectura',
          nombre: 'Facultad de Arquitectura',
          tipoConexion: TipoConexion.SERVIDOR_CENTRAL,
          servidor: 'sdb02',
          rutaBaseDatos: '/ruta/arquitectura/db.fdb'
        },
        {
          id: 'medicina',
          nombre: 'Facultad de Medicina',
          tipoConexion: TipoConexion.SERVIDOR_CENTRAL,
          servidor: 'sdb01',
          rutaBaseDatos: '/ruta/medicina/db.fdb'
        },
        {
          id: 'derecho',
          nombre: 'Facultad de Derecho',
          tipoConexion: TipoConexion.SERVIDOR_CENTRAL,
          servidor: 'sdb03',
          rutaBaseDatos: '/ruta/derecho/db.fdb'
        }
      ]
    },
    {
      id: 'colegios',
      nombre: 'Red de Colegios',
      filiales: [
        {
          id: 'colegio_san_jose',
          nombre: 'Colegio San José',
          tipoConexion: TipoConexion.SERVIDOR_PROPIO,
          servidor: '192.168.1.100',
          rutaBaseDatos: '/var/lib/firebird/data/biblioteca.fdb'
        },
        {
          id: 'colegio_santa_maria',
          nombre: 'Colegio Santa María',
          tipoConexion: TipoConexion.SERVIDOR_PROPIO,
          servidor: '192.168.2.200',
          rutaBaseDatos: '/var/lib/firebird/data/biblioteca.fdb'
        }
      ]
    },
    {
      id: 'bibliotecas_municipales',
      nombre: 'Bibliotecas Municipales',
      filiales: [
        {
          id: 'biblioteca_central',
          nombre: 'Biblioteca Central',
          tipoConexion: TipoConexion.SERVIDOR_CENTRAL,
          servidor: 'sdb04',
          rutaBaseDatos: '/ruta/biblioteca_central/db.fdb'
        },
        {
          id: 'biblioteca_sur',
          nombre: 'Biblioteca Sur',
          tipoConexion: TipoConexion.LOCAL
        }
      ]
    },
    {
      id: 'externa',
      nombre: 'Biblioteca Externa (Fuera de la red)',
      filiales: [
        {
          id: 'biblioteca_externa',
          nombre: 'Biblioteca Local (Seleccionar archivo)',
          tipoConexion: TipoConexion.LOCAL
        }
      ]
    }
  ];

  // Filiales filtradas según la institución seleccionada
  filialesFiltradas: Filial[] = [];

  // Filiales a las que tiene acceso el usuario
  filialesUsuario: Filial[] = [];

  constructor(
    private fb: FormBuilder,
    private sincronizacionService: SincronizacionService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    // Obtener usuario actual
    this.usuarioActual = this.authService.currentUserValue;

    // Verificar si el usuario tiene rol de administrador
    this.verificarRolAdmin();

    // Inicializar el formulario en el constructor con los nuevos campos
    this.configuracionForm = this.fb.group({
      institucionId: ['', Validators.required],
      filialId: ['', Validators.required],
      servidor: [{ value: '', disabled: true }, [
        Validators.required,
        Validators.minLength(3)
      ]],
      usuario: ['SYSDBA', [
        Validators.required,
        Validators.minLength(3)
      ]],
      contrasena: ['', [
        Validators.required,
        Validators.minLength(4)
      ]],
      rutaBaseDatos: [{ value: '', disabled: true }, Validators.required]
    });

    // Escuchar cambios en la selección de institución
    this.configuracionForm.get('institucionId')?.valueChanges.subscribe((institucionId) => {
      // Resetear la filial seleccionada
      this.configuracionForm.get('filialId')?.setValue('');
      this.archivoSeleccionado = null;

      // Filtrar las filiales según la institución seleccionada
      if (institucionId) {
        const institucion = this.instituciones.find(i => i.id === institucionId);

        // Si el usuario es administrador, mostrar todas las filiales de la institución
        if (this.esAdmin) {
          this.filialesFiltradas = institucion ? institucion.filiales : [];
        }
        // Si no es admin, mostrar solo las filiales a las que tiene acceso
        else if (this.usuarioActual && this.usuarioActual.filialesIds && this.usuarioActual.filialesIds.length > 0) {
          this.filialesFiltradas = institucion ? institucion.filiales.filter(filial =>
            this.usuarioActual?.filialesIds?.includes(filial.id)
          ) : [];
        }
        // Sin filiales asignadas
        else {
          this.filialesFiltradas = [];
        }
      } else {
        this.filialesFiltradas = [];
      }
    });

    // Escuchar cambios en la selección de filial
    this.configuracionForm.get('filialId')?.valueChanges.subscribe((filialId) => {
      if (filialId) {
        const filial = this.filialesFiltradas.find(f => f.id === filialId);
        if (filial) {
          // Establecer valores según el tipo de conexión
          if (filial.tipoConexion === TipoConexion.LOCAL) {
            // Para conexión local, habilitar campos para edición
            this.configuracionForm.get('servidor')?.enable();
            this.configuracionForm.get('rutaBaseDatos')?.enable();

            this.configuracionForm.patchValue({
              servidor: 'localhost',
              rutaBaseDatos: ''
            });

            // Resetear el archivo seleccionado cuando cambia la filial
            this.archivoSeleccionado = null;
          } else {
            // Para conexiones a servidores, establecer valores predefinidos
            this.configuracionForm.get('servidor')?.disable();
            this.configuracionForm.get('rutaBaseDatos')?.disable();

            this.configuracionForm.patchValue({
              servidor: filial.servidor || '',
              rutaBaseDatos: filial.rutaBaseDatos || ''
            });
          }
        }
      }
    });
  }

  ngOnInit(): void {
    // Determinar las filiales del usuario
    this.determinarFilialesUsuario();

    // Si el usuario solo pertenece a una institución y a una filial,
    // preseleccionar automáticamente
    this.preseleccionarInstitucionYFilial();

    // Cargar configuración guardada (solo si no se ha preseleccionado)
    this.cargarConfiguracionExistente();
  }

  /**
   * Método para pruebas - Cambiar entre diferentes perfiles de usuario
   * Solo disponible en modo desarrollo
   */
  cambiarPerfilUsuario(perfil: string): void {
    // Solo permitir cambiar perfiles en modo desarrollo
    if (!this.esModoDesarrollo) return;

    // Cambiar el perfil en el servicio de autenticación
    switch (perfil) {
      case 'simple':
        this.authService.simulateUserProfile('single_filial');
        break;
      case 'multiple':
        this.authService.simulateUserProfile('multiple_filiales');
        break;
      case 'admin':
        this.authService.simulateUserProfile('admin');
        break;
    }

    // Actualizar datos locales
    this.usuarioActual = this.authService.currentUserValue;
    this.verificarRolAdmin();

    // Resetear el formulario y valores relacionados
    this.configuracionForm.reset();
    this.filialesFiltradas = [];
    this.archivoSeleccionado = null;

    // Determinar las filiales y preseleccionar valores
    this.determinarFilialesUsuario();
    this.preseleccionarInstitucionYFilial();

    // Mostrar mensaje para informar al usuario
    this.mostrarMensaje(`Perfil cambiado a: ${perfil === 'simple' ? 'Usuario (Una filial)' :
      perfil === 'multiple' ? 'Usuario (Múltiples filiales)' :
        'Administrador'}`);
  }


  /**
   * Determina las filiales a las que pertenece el usuario actual
   */
  determinarFilialesUsuario(): void {
    // Si el usuario tiene filiales asignadas
    if (this.usuarioActual && this.usuarioActual.filialesIds && this.usuarioActual.filialesIds.length > 0) {
      // Determinar si tiene múltiples filiales
      this.tieneMultiplesFiliales = this.usuarioActual.filialesIds.length > 1;

      // Encontrar todas las filiales a las que tiene acceso el usuario
      this.filialesUsuario = [];

      for (const institucion of this.instituciones) {
        for (const filial of institucion.filiales) {
          if (this.usuarioActual.filialesIds.includes(filial.id)) {
            this.filialesUsuario.push(filial);
          }
        }
      }
    }
  }

  /**
   * Preselecciona la institución y filial según los datos del usuario
   */
  preseleccionarInstitucionYFilial(): void {
    // Si el usuario tiene una institución asignada
    if (this.usuarioActual && this.usuarioActual.institucionId) {
      // Establecer la institución
      this.configuracionForm.patchValue({
        institucionId: this.usuarioActual.institucionId
      });

      // Si el usuario solo tiene una filial, preseleccionarla
      if (this.usuarioActual.filialesIds && this.usuarioActual.filialesIds.length === 1) {
        // Esperar a que se carguen las filiales filtradas
        setTimeout(() => {
          this.configuracionForm.patchValue({
            filialId: this.usuarioActual?.filialesIds?.[0]
          });
        }, 0);
      }
    }
    // Si no tiene institución asignada pero tiene una sola filial
    else if (this.filialesUsuario.length === 1) {
      // Encontrar la institución correspondiente
      const filialId = this.filialesUsuario[0].id;
      let institucionId = '';

      for (const institucion of this.instituciones) {
        const filialEncontrada = institucion.filiales.find(f => f.id === filialId);
        if (filialEncontrada) {
          institucionId = institucion.id;
          break;
        }
      }

      // Establecer institución y filial
      if (institucionId) {
        this.configuracionForm.patchValue({
          institucionId: institucionId
        });

        // Esperar a que se carguen las filiales filtradas
        setTimeout(() => {
          this.configuracionForm.patchValue({
            filialId: filialId
          });
        }, 0);
      }
    }
  }

  /**
   * Verifica si el usuario actual tiene rol de administrador
   */
  verificarRolAdmin(): void {
    if (this.usuarioActual && this.usuarioActual.roles) {
      this.esAdmin = this.usuarioActual.roles.includes(Role.ADMIN);
    }
  }

  /**
   * Navega de regreso al dashboard
   */
  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  cargarConfiguracionExistente(): void {
    this.sincronizacionService.obtenerConfiguracion().subscribe({
      next: (config) => {
        // Solo cargar la configuración si no se ha preseleccionado
        if (config && !this.configuracionForm.get('filialId')?.value) {
          // Si ya hay una configuración guardada
          if (config.institucionId && config.filialId) {
            // Primero establecer la institución para cargar las filiales
            this.configuracionForm.patchValue({
              institucionId: config.institucionId
            });

            // Luego establecer la filial (esto activará el listener que configurará servidor y ruta)
            setTimeout(() => {
              this.configuracionForm.patchValue({
                filialId: config.filialId
              });
            }, 0);

            // Credenciales
            this.configuracionForm.patchValue({
              usuario: config.usuario || 'SYSDBA',
              contrasena: config.contrasena || ''
            });

            // Si es LOCAL, permitir editar servidor y ruta
            const institucion = this.instituciones.find(i => i.id === config.institucionId);
            const filial = institucion?.filiales.find(f => f.id === config.filialId);

            if (filial?.tipoConexion === TipoConexion.LOCAL) {
              this.configuracionForm.get('servidor')?.enable();
              this.configuracionForm.get('rutaBaseDatos')?.enable();

              // Actualizar con valores guardados
              this.configuracionForm.patchValue({
                servidor: config.servidor || 'localhost',
                rutaBaseDatos: config.rutaBaseDatos || ''
              });
            }
          }
          // Si no hay información de institución/filial pero hay datos de conexión
          else if (config.servidor) {
            // Para compatibilidad con la configuración anterior
            this.configuracionForm.patchValue({
              servidor: config.servidor || 'localhost',
              usuario: config.usuario || 'SYSDBA',
              rutaBaseDatos: config.rutaBaseDatos || ''
            });
          }
        }
      },
      error: (error) => {
        // Log de error para depuración
        console.error('Error al cargar configuración:', error);
        this.mostrarMensaje('No se pudo cargar la configuración existente');
      }
    });
  }

  seleccionarArchivo(evento: any): void {
    const archivo = evento.target.files[0];
    if (archivo) {
      // Validación de archivo
      const extensionesPermitidas = ['.gdb', '.fdb'];
      const extensionValida = extensionesPermitidas.some(ext =>
        archivo.name.toLowerCase().endsWith(ext)
      );

      if (extensionValida) {
        this.archivoSeleccionado = archivo;
        this.configuracionForm.patchValue({
          rutaBaseDatos: archivo.name
        });

        // Mostrar mensaje de éxito
        this.mostrarMensaje(`Archivo "${archivo.name}" seleccionado correctamente`);
      } else {
        this.mostrarMensaje(`Solo se permiten archivos: ${extensionesPermitidas.join(', ')}`);
        evento.target.value = '';
      }
    }
  }


  
  guardarConfiguracion(): void {
    // Marcar todos los campos como tocados para mostrar validaciones
    this.configuracionForm.markAllAsTouched();

    if (this.configuracionForm.valid) {
      this.cargando = true;

      // Obtener valores del formulario
      const formValues = this.configuracionForm.getRawValue(); // getRawValue incluye campos disabled

      const configuracion: ConfiguracionSincronizacion = {
        institucionId: formValues.institucionId,
        filialId: formValues.filialId,
        servidor: formValues.servidor,
        usuario: formValues.usuario,
        contrasena: formValues.contrasena,
        rutaBaseDatos: formValues.rutaBaseDatos,
        ultimaSincronizacion: new Date()
      };

      // Si es una biblioteca local y hay un archivo seleccionado,
      // procesamos el archivo antes de guardar la configuración
      if (this.esConexionLocal() && this.archivoSeleccionado) {
        // Aquí iría el código para manejar la subida del archivo
        // Por ejemplo, usando FormData y un servicio específico

        // Ejemplo hipotético:
        const formData = new FormData();
        formData.append('archivo', this.archivoSeleccionado);

        this.sincronizacionService.subirArchivoBaseDatos(formData).subscribe({
          next: (resultado: { rutaServidor: string, exito: boolean, mensaje?: string }) => {
            // Asegúrate de verificar que el resultado contiene la propiedad esperada
            if (resultado && resultado.rutaServidor) {
              configuracion.rutaBaseDatos = resultado.rutaServidor;
              this.finalizarGuardadoConfiguracion(configuracion);
            } else {
              console.warn('La respuesta no contiene una ruta de servidor válida');
              this.mostrarMensaje('Error: Respuesta incompleta del servidor');
              this.cargando = false;
            }
          },
          error: (error: Error) => {
            console.error('Error al subir el archivo:', error);
            this.mostrarMensaje('Error al subir el archivo de base de datos');
            this.cargando = false;
          }
        });
      } else {
        // Si no hay archivo que subir, guardar configuración directamente
        this.finalizarGuardadoConfiguracion(configuracion);
      }
    } else {
      this.mostrarMensaje('Por favor complete correctamente todos los campos');
    }
  }

  /**
   * Finaliza el guardado de la configuración después de procesar el archivo si es necesario
   */
  private finalizarGuardadoConfiguracion(configuracion: ConfiguracionSincronizacion): void {
    this.sincronizacionService.guardarConfiguracion(configuracion).subscribe({
      next: () => {
        this.mostrarMensaje('Configuración guardada exitosamente');
        this.cargando = false;

        // Opcional: redirigir al dashboard después de guardar exitosamente
        // setTimeout(() => this.volverAlDashboard(), 1500);
      },
      error: (error) => {
        console.error('Error al guardar configuración:', error);
        this.mostrarMensaje(
          error?.error?.mensaje || 'Error al guardar la configuración'
        );
        this.cargando = false;
      }
    });
  }

  probarConexion(): void {
    // Marcar todos los campos como tocados
    this.configuracionForm.markAllAsTouched();

    if (this.configuracionForm.valid) {
      this.cargando = true;

      // Obtener valores incluyendo los campos deshabilitados
      const formValues = this.configuracionForm.getRawValue();

      const configuracion: ConfiguracionSincronizacion = {
        servidor: formValues.servidor,
        usuario: formValues.usuario,
        contrasena: formValues.contrasena,
        rutaBaseDatos: formValues.rutaBaseDatos
      };

      this.sincronizacionService.probarConexion(configuracion).subscribe({
        next: (resultado) => {
          this.mostrarMensaje(
            resultado ? 'Conexión establecida exitosamente' : 'Error de conexión'
          );
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al probar conexión:', error);
          this.mostrarMensaje(
            error?.error?.mensaje || 'Error al probar la conexión'
          );
          this.cargando = false;
        }
      });
    }
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  /**
   * Verifica si la filial seleccionada usa conexión local
   */
  esConexionLocal(): boolean {
    const filialId = this.configuracionForm.get('filialId')?.value;
    if (filialId) {
      const filial = this.filialesFiltradas.find(f => f.id === filialId);
      return filial?.tipoConexion === TipoConexion.LOCAL;
    }
    return false;
  }

  /**
   * Verifica si la conexión es a un servidor propio de la institución
   */
  esServidorPropio(): boolean {
    const filialId = this.configuracionForm.get('filialId')?.value;
    if (filialId) {
      const filial = this.filialesFiltradas.find(f => f.id === filialId);
      return filial?.tipoConexion === TipoConexion.SERVIDOR_PROPIO;
    }
    return false;
  }

  /**
   * Verifica si la conexión está preconfigurada (servidor central o propio)
   * y no es editable por usuarios normales
   */
  esConexionPreconfigurada(): boolean {
    return !this.esConexionLocal() && !this.esAdmin;
  }


  /**
   * Verifica si está seleccionada la opción de biblioteca externa
   */
  esBibliotecaExterna(): boolean {
    return this.configuracionForm.get('institucionId')?.value === 'externa';
  }

  // En src/app/features/sincronizacion/components/sincronizacion-configuracion.component.ts

  /**
 * Método para seleccionar archivo Firebird específicamente
 * Mejora la experiencia de usuario y proporciona validaciones
 */
  seleccionarArchivoFirebird(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.gdb';

    input.onchange = (event: any) => {
      const archivo = event.target.files[0];

      if (archivo && archivo.name.toLowerCase().endsWith('.gdb')) {
        this.archivoSeleccionado = archivo;

        // Actualizar ruta de base de datos
        this.configuracionForm.patchValue({
          rutaBaseDatos: archivo.path || archivo.name
        });

        this.mostrarMensaje(`Archivo Firebird 2.5 "${archivo.name}" seleccionado`);
      } else {
        this.mostrarMensaje('Seleccione solo archivos .gdb de Firebird 2.5');
      }
    };

    input.click();
  }

  limpiarArchivoSeleccionado(): void {
    this.archivoSeleccionado = null;
    this.configuracionForm.patchValue({
      rutaBaseDatos: ''
    });
    this.mostrarMensaje('Archivo de base de datos eliminado');
  }

}


