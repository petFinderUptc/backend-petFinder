/**
 * Tipos de Documento para Cosmos DB - User
 *
 * Define la estructura exacta de los documentos almacenados en Cosmos DB.
 * Esta capa de infraestructura mapea la entidad de dominio a la persistencia.
 */

import { UserRole } from '../../../domain/enums';

/**
 * Documento de Usuario en Cosmos DB
 *
 * Estructura completa del documento tal como se almacena en Azure Cosmos DB.
 * Incluye tanto campos de dominio como metadatos de Cosmos DB.
 */
export interface UserDocument {
  // === Campos de Dominio ===

  /** ID único del usuario (UUID v4) */
  id: string;

  /** Email del usuario - PARTITION KEY (debe ser único) */
  email: string;

  /** Username único del usuario - UNIQUE KEY */
  username: string;

  /** Contraseña hasheada (bcrypt) */
  password: string;

  /** Nombre(s) del usuario */
  firstName: string;

  /** Apellido(s) del usuario */
  lastName: string;

  /** Número de teléfono móvil (formato: +57XXXXXXXXXX) */
  phoneNumber?: string;

  /** URL de imagen de perfil (Azure Blob Storage o CDN) */
  profileImage?: string;

  /** Ciudad de residencia */
  city?: string;

  /** Departamento de Colombia */
  department?: string;

  /** Biografía del usuario (max 500 caracteres) */
  bio?: string;

  // === Control de Acceso ===

  /** Rol del usuario en el sistema */
  role: UserRole;

  /** Indica si la cuenta está activa */
  isActive: boolean;

  /** Indica si el email ha sido verificado */
  emailVerified: boolean;

  /** Indica si el teléfono ha sido verificado */
  phoneVerified: boolean;

  // === Seguridad ===

  /** Fecha y hora del último login exitoso */
  lastLogin?: string; // ISO 8601

  /** Número de intentos fallidos de login consecutivos */
  failedLoginAttempts: number;

  /** Fecha hasta la cual la cuenta está bloqueada */
  accountLockedUntil?: string; // ISO 8601

  // === Auditoría ===

  /** Fecha de creación del registro (ISO 8601) */
  createdAt: string;

  /** Fecha de última actualización (ISO 8601) */
  updatedAt: string;

  // === Metadatos de Cosmos DB (automáticos) ===

  /** Resource ID asignado por Cosmos DB */
  _rid?: string;

  /** Self-link del documento */
  _self?: string;

  /** ETag para control de concurrencia optimista */
  _etag?: string;

  /** Timestamp de Cosmos DB (Unix epoch) */
  _ts?: number;
}

/**
 * Tipo para crear un nuevo documento de usuario
 * Omite campos automáticos de Cosmos DB
 */
export type CreateUserDocument = Omit<UserDocument, '_rid' | '_self' | '_etag' | '_ts'>;

/**
 * Tipo para actualizar un documento de usuario
 * Todos los campos excepto id y email (partition key) son opcionales
 */
export type UpdateUserDocument = Partial<
  Omit<UserDocument, 'id' | 'email' | '_rid' | '_self' | '_etag' | '_ts'>
>;

/**
 * Tipo para consultas de usuario (solo lectura)
 * Incluye todos los campos excepto la contraseña
 */
export type UserQueryResult = Omit<UserDocument, 'password'>;

/**
 * Índices configurados en el contenedor users
 *
 * Partition Key: /email
 * - Distribución uniforme de datos
 * - Lecturas ultra-rápidas por email
 *
 * Unique Keys:
 * - /username (garantiza usernames únicos)
 * - /email (garantizado por partition key)
 *
 * Índices Compuestos:
 * 1. /username (ASC) + /createdAt (DESC)
 *    → Búsquedas de usuarios por username
 *
 * 2. /role (ASC) + /createdAt (DESC)
 *    → Filtrado de usuarios por rol
 *
 * 3. /isActive (ASC) + /updatedAt (DESC)
 *    → Usuarios activos/inactivos ordenados por actividad
 */

/**
 * Ejemplos de Queries Optimizadas
 *
 * @example
 * // Query por email (single-partition, 2-3 RUs)
 * SELECT * FROM c WHERE c.email = "user@example.com"
 *
 * @example
 * // Query por username con índice compuesto (3-5 RUs)
 * SELECT * FROM c
 * WHERE c.username = "john_doe"
 * ORDER BY c.createdAt DESC
 *
 * @example
 * // Filtrar por rol con índice compuesto (3-5 RUs)
 * SELECT * FROM c
 * WHERE c.role = "admin"
 * ORDER BY c.createdAt DESC
 *
 * @example
 * // Usuarios activos ordenados por última actividad (3-5 RUs)
 * SELECT * FROM c
 * WHERE c.isActive = true
 * ORDER BY c.updatedAt DESC
 *
 * @example
 * // Usuarios con email no verificado
 * SELECT * FROM c
 * WHERE c.emailVerified = false
 * AND c.isActive = true
 *
 * @example
 * // Usuarios bloqueados actualmente
 * SELECT * FROM c
 * WHERE c.accountLockedUntil > GetCurrentDateTime()
 */
