/**
 * Servicio de Hash de Contraseñas
 *
 * Centraliza toda la lógica de hash y validación de contraseñas usando bcrypt.
 * Este servicio proporciona una capa de abstracción sobre bcrypt para:
 * - Mantener consistencia en toda la aplicación
 * - Facilitar testing y mocking
 * - Configuración centralizada de salt rounds
 * - Mejor manejo de errores
 *
 * Seguridad:
 * - Usa bcrypt con salt rounds configurables (mínimo recomendado: 10)
 * - El hash es resistente a ataques de fuerza bruta y rainbow tables
 * - Cada contraseña tiene un salt único automáticamente
 */

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHashService {
  private readonly saltRounds: number;

  constructor(private readonly configService: ConfigService) {
    // Obtener salt rounds desde configuración o usar valor por defecto (12)
    // Valores recomendados: 10-12 (más alto = más seguro pero más lento)
    this.saltRounds = this.configService.get<number>('security.bcryptSaltRounds') || 12;
  }

  /**
   * Hashear una contraseña usando bcrypt
   * 
   * @param password - Contraseña en texto plano
   * @returns Contraseña hasheada
   * @throws InternalServerErrorException si falla el proceso de hash
   * 
   * @example
   * const hash = await passwordHashService.hash('myPassword123');
   * // Retorna: '$2b$12$...' (60 caracteres)
   */
  async hash(password: string): Promise<string> {
    try {
      // bcrypt.hash genera automáticamente un salt único para cada contraseña
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      return hashedPassword;
    } catch (error) {
      // Nunca exponer la contraseña en el error
      throw new InternalServerErrorException(
        'Error al procesar la contraseña. Por favor, intente nuevamente.'
      );
    }
  }

  /**
   * Comparar una contraseña en texto plano con su hash
   * 
   * @param password - Contraseña en texto plano a verificar
   * @param hashedPassword - Hash almacenado en la base de datos
   * @returns true si la contraseña coincide, false en caso contrario
   * @throws InternalServerErrorException si falla la comparación
   * 
   * @example
   * const isValid = await passwordHashService.compare('myPassword123', storedHash);
   * // Retorna: true si coincide, false si no
   */
  async compare(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error) {
      // Error al comparar (ej: hash inválido)
      throw new InternalServerErrorException(
        'Error al validar las credenciales. Por favor, intente nuevamente.'
      );
    }
  }

  /**
   * Verificar si un string es un hash válido de bcrypt
   * Útil para validaciones o migraciones de datos
   * 
   * @param hash - String a verificar
   * @returns true si es un hash válido de bcrypt
   * 
   * @example
   * passwordHashService.isHashValid('$2b$12$...') // true
   * passwordHashService.isHashValid('plaintext') // false
   */
  isHashValid(hash: string): boolean {
    // Los hashes de bcrypt tienen un formato específico:
    // $2a$, $2b$, o $2y$ seguido de rounds y salt/hash
    const bcryptRegex = /^\$2[aby]\$\d{2}\$.{53}$/;
    return bcryptRegex.test(hash);
  }

  /**
   * Obtener el número de salt rounds configurado
   * Útil para auditorías y verificaciones de seguridad
   * 
   * @returns Número de rounds configurado
   */
  getSaltRounds(): number {
    return this.saltRounds;
  }

  /**
   * Verificar si un hash necesita ser rehash (por cambio de salt rounds)
   * Si los salt rounds se incrementan, los hashes antiguos deberían actualizarse
   * 
   * @param hashedPassword - Hash a verificar
   * @returns true si necesita rehash, false en caso contrario
   * 
   * @example
   * // Si el hash fue creado con 10 rounds pero ahora usamos 12
   * passwordHashService.needsRehash(oldHash) // true
   */
  needsRehash(hashedPassword: string): boolean {
    try {
      // Extraer el número de rounds del hash existente
      // Formato: $2b$12$... donde 12 es el número de rounds
      const rounds = parseInt(hashedPassword.split('$')[2], 10);
      return rounds < this.saltRounds;
    } catch (error) {
      // Si no se puede parsear, asumir que necesita rehash por seguridad
      return true;
    }
  }
}
