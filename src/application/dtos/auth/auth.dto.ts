/**
 * DTOs para autenticación
 *
 * Capa de Aplicación - Define contratos de entrada/salida
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * DTO para registro de usuario
 */
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email del usuario' })
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @ApiProperty({ example: 'username123', description: 'Nombre de usuario' })
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{3,20}$/, {
    message: 'Username debe tener entre 3-20 caracteres alfanuméricos, guiones o guiones bajos',
  })
  username: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña del usuario' })
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
}

/**
 * DTO para login
 */
export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email para login' })
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña' })
  @IsString()
  @MinLength(8)
  password: string;
}

/**
 * DTO de respuesta para autenticación exitosa
 */
export class AuthUserDto {
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
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT de acceso',
  })
  accessToken: string;

  @ApiProperty({ description: 'Datos del usuario autenticado', type: AuthUserDto })
  user: AuthUserDto;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
