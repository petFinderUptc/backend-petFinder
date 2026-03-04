/**
 * DTOs para autenticación
 *
 * Capa de Aplicación - Define contratos de entrada/salida
 */

import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

/**
 * DTO para registro de usuario
 */
export class RegisterDto {
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
}

/**
 * DTO para login
 */
export class LoginDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

/**
 * DTO de respuesta para autenticación exitosa
 */
export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
