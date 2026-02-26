/**
 * Interface para la entidad User
 *
 * Define la estructura de un usuario en el sistema.
 * En FASE 2 esto se convertirá en un modelo de Cosmos DB.
 */

export interface IUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImage?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}
