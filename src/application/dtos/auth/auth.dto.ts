/**
 * DTOs para autenticación
 *
 * Capa de Aplicación - Define contratos de entrada/salida
 */

import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

/**
 * DTO para registro de usuario
 */
export class RegisterDto {
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

export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  token?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  refreshToken?: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(10)
  token: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50)
  newPassword: string;
}

export class VerifyEmailDto {
  @IsString()
  @MinLength(10)
  token: string;
}

/**
 * DTO de respuesta para autenticación exitosa
 */
export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
