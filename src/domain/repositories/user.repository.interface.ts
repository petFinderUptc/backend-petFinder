/**
 * Interface de Repositorio: UserRepository
 *
 * Define el contrato que debe cumplir cualquier implementación
 * de repositorio de usuarios (in-memory, Cosmos DB, SQL, etc.)
 *
 * Principio de Inversión de Dependencias (SOLID):
 * - La capa de dominio define el contrato
 * - La capa de infraestructura lo implementa
 */

import { User } from '../entities';

export interface IUserRepository {
  /**
   * Crear un nuevo usuario
   */
  create(user: User): Promise<User>;

  /**
   * Buscar usuario por ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Buscar usuario por email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Obtener todos los usuarios
   */
  findAll(): Promise<User[]>;

  /**
   * Actualizar usuario
   */
  update(id: string, user: Partial<User>): Promise<User>;

  /**
   * Eliminar usuario
   */
  delete(id: string): Promise<void>;

  /**
   * Verificar si existe un email
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Buscar usuario por username
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Verificar si existe un username
   */
  existsByUsername(username: string): Promise<boolean>;
}
