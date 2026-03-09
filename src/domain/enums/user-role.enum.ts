/**
 * Enum de roles de usuario
 *
 * Define los diferentes roles que puede tener un usuario en el sistema.
 * Parte de la capa de dominio - lógica de negocio pura.
 */

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}
