// src/app/features/sincronizacion/models/institucion-filial.model.ts

/**
 * Tipo de conexión para la base de datos
 */
export enum TipoConexion {
    /** Base de datos en servidor centralizado */
    SERVIDOR_CENTRAL = 'servidor_central',
    
    /** Base de datos en servidor propio de la institución */
    SERVIDOR_PROPIO = 'servidor_propio',
    
    /** Base de datos local en la máquina del usuario */
    LOCAL = 'local'
  }
  
  /**
   * Interfaz que define una filial de una institución
   */
  export interface Filial {
    /** Identificador único de la filial */
    id: string;
    
    /** Nombre de la filial */
    nombre: string;
    
    /** Tipo de conexión para la base de datos */
    tipoConexion: TipoConexion;
    
    /** Servidor donde se encuentra la base de datos (si aplica) */
    servidor?: string;
    
    /** Ruta predeterminada a la base de datos (si aplica) */
    rutaBaseDatos?: string;
  }
  
  /**
   * Interfaz que define una institución
   */
  export interface Institucion {
    /** Identificador único de la institución */
    id: string;
    
    /** Nombre de la institución */
    nombre: string;
    
    /** Filiales pertenecientes a la institución */
    filiales: Filial[];
  }