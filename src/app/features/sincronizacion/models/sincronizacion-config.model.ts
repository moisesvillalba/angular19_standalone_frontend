// Remove the first import and keep only the correct one
import { TipoBaseDatos } from './tipos'; // Ajusta la ruta según tu estructura

/**
 * Interfaz que define la configuración de sincronización
 * con la base de datos de una biblioteca
 */
export interface ConfiguracionSincronizacion {
  /** Identificador de la institución seleccionada */
  institucionId?: string;
  
  /** Identificador de la filial seleccionada */
  filialId?: string;
  
  /** Tipo de base de datos (Firebird, SQLite) */
  tipoBaseDatos?: TipoBaseDatos;
  
  /** Dirección del servidor donde se encuentra la base de datos */
  servidor: string;
  
  /** Nombre de usuario para la conexión */
  usuario: string;
  
  /** Contraseña para la conexión */
  contrasena: string;
  
  /** Ruta completa al archivo de base de datos */
  rutaBaseDatos: string;
  
  /** Fecha y hora de la última sincronización exitosa */
  ultimaSincronizacion?: Date;
}