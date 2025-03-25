// Objecto que define la estructura de un usuario en el sistema
/**
 * Enumeración de roles disponibles en el sistema
 */
export enum Role {
  USER = 'USER',
  LIBRARIAN = 'LIBRARIAN',
  ADMIN = 'ADMIN'
}

/**
 * Interfaz que define la información de un usuario autenticado en el sistema
 */
export interface User {
  /** Identificador único del usuario */
  id: string;
  
  /** Nombre de usuario para login */
  username: string;
  
  /** Nombre completo del usuario */
  fullName?: string;
  
  /** Correo electrónico del usuario */
  email: string;
  
  /** Roles asignados al usuario */
  roles: Role[];
  
  /** Token de autenticación */
  token?: string;
  
  /** Identificador de la institución a la que pertenece */
  institucionId?: string;
  
  /** Identificadores de las instituciones a las que tiene acceso */
  institucionesIds?: string[];
  
  /** Identificadores de las filiales a las que tiene acceso */
  filialesIds?: string[];
  
  /** Institución actualmente seleccionada para trabajar */
  institucionActiva?: string;
  
  /** Filial actualmente seleccionada para trabajar */
  filialActiva?: string;
}