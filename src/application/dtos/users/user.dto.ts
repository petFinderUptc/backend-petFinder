/**
 * DTOs para el módulo de usuarios
 *
 * Capa de Aplicación - Define contratos de entrada/salida
 */

import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { UserRole } from '../../../domain/enums';

/**
 * DTO para crear un nuevo usuario
 */
export class CreateUserDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsOptional()
  @IsPhoneNumber('CO', { message: 'Número de teléfono inválido para Colombia' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}

/**
 * DTO para actualizar un usuario
 * Todos los campos son opcionales
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber('CO')
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}

/**
 * DTO para respuesta de usuario
 * No incluye información sensible como contraseña
 */
export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImage?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
