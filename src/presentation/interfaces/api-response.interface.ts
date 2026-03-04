/**
 * Interfaz genérica para respuestas HTTP estandarizadas
 *
 * Útil para mantener consistencia en las respuestas de la API
 */

export interface IApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp: Date;
}

/**
 * Interfaz para respuestas paginadas
 *
 * TODO: FASE 2 - Implementar en endpoints que retornen listas
 */
export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
