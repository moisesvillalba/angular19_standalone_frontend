export enum Role {
    USER = 'USER',
    LIBRARIAN = 'LIBRARIAN',
    ADMIN = 'ADMIN'
  }
  
  export interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    roles: Role[];
  }