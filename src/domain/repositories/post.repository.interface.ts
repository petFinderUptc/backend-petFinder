/**
 * Interface de Repositorio: PostRepository
 *
 * Define el contrato que debe cumplir cualquier implementación
 * de repositorio de publicaciones.
 */

import { Post } from '../entities';
import { PostType, PostStatus, PetType, PetSize } from '../enums';

export interface PostFilters {
  type?: PostType;
  status?: PostStatus;
  petType?: PetType;
  size?: PetSize;
  city?: string;
  userId?: string;
}

export interface IPostRepository {
  /**
   * Crear una nueva publicación
   */
  create(post: Post): Promise<Post>;

  /**
   * Buscar publicación por ID
   */
  findById(id: string): Promise<Post | null>;

  /**
   * Obtener todas las publicaciones
   */
  findAll(): Promise<Post[]>;

  /**
   * Buscar publicaciones por filtros
   */
  findByFilters(filters: PostFilters): Promise<Post[]>;

  /**
   * Obtener publicaciones de un usuario
   */
  findByUserId(userId: string): Promise<Post[]>;

  /**
   * Actualizar publicación
   */
  update(id: string, post: Partial<Post>): Promise<Post>;

  /**
   * Eliminar publicación
   */
  delete(id: string): Promise<void>;

  /**
   * Contar publicaciones activas
   */
  countActive(): Promise<number>;
}
