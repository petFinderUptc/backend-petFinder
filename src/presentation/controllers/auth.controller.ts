/**
 * Controlador de Autenticación
 *
 * Capa de Presentación - Endpoints HTTP para autenticación
 *
 * Endpoints públicos:
 * - POST /auth/register - Registro de nuevos usuarios
 * - POST /auth/login - Login de usuarios existentes
 *
 * FASE 2: Agregar endpoints para
 * - POST /auth/refresh - Refresh token
 * - POST /auth/forgot-password - Solicitar reset de contraseña
 * - POST /auth/reset-password - Resetear contraseña
 * - POST /auth/verify-email - Verificar email
 */

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../../application/services';
import { RegisterDto, LoginDto, AuthResponseDto } from '../../application/dtos/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registro de nuevo usuario
   * POST /api/v1/auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Login de usuario
   * POST /api/v1/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  // TODO: FASE 2 - Implementar endpoints adicionales
  // @Post('refresh')
  // async refreshToken(@Body() refreshDto: RefreshTokenDto): Promise<AuthResponseDto>
  //
  // @Post('forgot-password')
  // async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void>
  //
  // @Post('reset-password')
  // async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void>
  //
  // @Post('verify-email')
  // async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<void>
}
