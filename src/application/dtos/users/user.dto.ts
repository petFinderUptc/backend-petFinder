/**
 * DTOs para el módulo de usuarios
 *
 * Capa de Aplicación - Define contratos de entrada/salida
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'user@example.com', description: 'Email del nuevo usuario' })
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @ApiProperty({ example: 'username123', description: 'Nombre de usuario' })
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{3,20}$/, {
    message: 'Username debe tener entre 3-20 caracteres alfanuméricos, guiones o guiones bajos',
  })
  username: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50)
  password: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiPropertyOptional({ example: '+573001234567', description: 'Teléfono' })
  @IsOptional()
  @IsPhoneNumber('CO', { message: 'Número de teléfono inválido para Colombia' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: 'URL de avatar' })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiPropertyOptional({ example: 'Bogotá', description: 'Ciudad' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  city?: string;

  @ApiPropertyOptional({ example: 'Cundinamarca', description: 'Departamento' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  department?: string;

  @ApiPropertyOptional({ example: 'Amante de los animales', description: 'Biografía del usuario' })
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
  @ApiPropertyOptional({ example: 'Juan', description: 'Nombre' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Pérez', description: 'Apellido' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ example: '+573001234567', description: 'Teléfono' })
  @IsOptional()
  @IsPhoneNumber('CO')
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: 'URL de avatar' })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiPropertyOptional({ example: 'Bogotá', description: 'Ciudad' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  city?: string;

  @ApiPropertyOptional({ example: 'Cundinamarca', description: 'Departamento' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  department?: string;

  @ApiPropertyOptional({ example: 'Amante de los animales', description: 'Biografía del usuario' })
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
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del usuario' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email del usuario' })
  email: string;

  @ApiProperty({ example: 'username123', description: 'Nombre de usuario' })
  username: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre' })
  firstName: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido' })
  lastName: string;

  @ApiPropertyOptional({ example: 'Juan Pérez', description: 'Nombre completo' })
  fullName?: string;

  @ApiPropertyOptional({ example: '+573001234567', description: 'Teléfono' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: 'URL de avatar' })
  profileImage?: string;

  @ApiPropertyOptional({ example: 'Bogotá', description: 'Ciudad' })
  city?: string;

  @ApiPropertyOptional({ example: 'Cundinamarca', description: 'Departamento' })
  department?: string;

  @ApiPropertyOptional({ example: 'Bogotá, Cundinamarca', description: 'Ubicación completa' })
  fullLocation?: string;

  @ApiPropertyOptional({ example: 'Amante de los animales', description: 'Biografía' })
  bio?: string;

  @ApiProperty({ enum: UserRole, description: 'Rol del usuario' })
  role: UserRole;

  @ApiProperty({ example: true, description: 'Usuario activo' })
  isActive: boolean;

  @ApiProperty({ example: true, description: 'Email verificado' })
  emailVerified: boolean;

  @ApiProperty({ example: true, description: 'Teléfono verificado' })
  phoneVerified: boolean;

  @ApiPropertyOptional({
    example: '2025-01-01T12:00:00.000Z',
    description: 'Último inicio de sesión',
  })
  lastLogin?: Date;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z', description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-02T12:00:00.000Z', description: 'Fecha de actualización' })
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
