// src/app/features/sincronizacion/services/sincronizacion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfiguracionSincronizacion } from '../models/sincronizacion-config.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SincronizacionService {
  // URL base para endpoints de sincronización
  private apiUrl = `${environment.apiUrl}/sincronizacion`;

  constructor(private http: HttpClient) { }

  /**
   * Guarda la configuración de sincronización
   * @param configuracion Datos de configuración
   */
  guardarConfiguracion(configuracion: ConfiguracionSincronizacion): Observable<any> {
    return this.http.post(`${this.apiUrl}/configuracion`, configuracion);
  }

  /**
   * Obtiene la configuración de sincronización actual
   */
  obtenerConfiguracion(): Observable<ConfiguracionSincronizacion> {
    return this.http.get<ConfiguracionSincronizacion>(`${this.apiUrl}/configuracion`);
  }

  /**
 * Sube un archivo de base de datos al servidor
 * @param formData Formulario con el archivo a subir
 * @returns Observable con la respuesta que incluye la ruta del archivo en el servidor
 */
  subirArchivoBaseDatos(formData: FormData): Observable<{ rutaServidor: string, exito: boolean, mensaje?: string }> {
    return this.http.post<{ rutaServidor: string, exito: boolean, mensaje?: string }>(`${this.apiUrl}/subir-archivo`, formData);
  }
  /**
   * Prueba la conexión con los parámetros proporcionados
   * @param configuracion Datos de conexión a probar
   */
  probarConexion(configuracion: ConfiguracionSincronizacion): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/probar-conexion`, configuracion);
  }
}

