/**
 * Enum de estados de publicación
 *
 * Define el ciclo de vida de una publicación.
 */

export enum PostStatus {
  ACTIVE = 'active', // Publicación activa
  RESOLVED = 'resolved', // Mascota encontrada/reunida
  INACTIVE = 'inactive', // Publicación desactivada
}
