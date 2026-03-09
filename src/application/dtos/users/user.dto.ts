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
  Matches,
} from 'class-validator';
import { UserRole } from '../../../domain/enums';

/**
 * DTO para crear un nuevo usuario
 */
export class CreateUserDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{3,20}$/, {
    message: 'Username debe tener entre 3-20 caracteres alfanuméricos, guiones o guiones bajos',
  })
  username: string;

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

  @IsOptional()
  @IsString()
  @MaxLength(50)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La biografía no puede exceder 500 caracteres' })
  bio?: string;
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

  @IsOptional()
  @IsString()
  @MaxLength(50)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}

/**
 * DTO para respuesta de usuario
 * No incluye información sensible como contraseña
 */
export class UserResponseDto {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phoneNumber?: string;
  profileImage?: string;
  city?: string;
  department?: string;
  fullLocation?: string;
  bio?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
