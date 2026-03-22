import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../../application/services';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../../application/dtos/auth';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, UserFromJwt } from '../decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registro de usuario',
    description: 'Registra un usuario nuevo y retorna token JWT con datos del usuario',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado correctamente',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login de usuario',
    description: 'Autentica con email y password, retorna token JWT',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refrescar token',
    description: 'Renueva el token JWT con refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token renovado',
    schema: { example: { accessToken: '...' } },
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    const token = refreshTokenDto.token ?? refreshTokenDto.refreshToken;
    return this.authService.refresh(token || '');
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar token',
    description: 'Valida que un token de refresco sea válido',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token válido', schema: { example: { valid: true } } })
  async verifyByToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ valid: boolean }> {
    const token = refreshTokenDto.token ?? refreshTokenDto.refreshToken;
    await this.authService.validateToken(token || '');
    return { valid: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout',
    description: 'Cierra la sesión del usuario (invalidar token)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada',
    schema: { example: { message: 'Logout realizado' } },
  })
  async logout(): Promise<{ message: string }> {
    return this.authService.logout();
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar sesión JWT',
    description: 'Verifica token JWT y retorna usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    schema: { example: { valid: true, user: {} } },
  })
  async verify(@CurrentUser() user: UserFromJwt): Promise<{ valid: boolean; user: UserFromJwt }> {
    return { valid: true, user };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar email',
    description: 'Verifica código de activación de email',
  })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Email verificado',
    schema: { example: { message: 'Email verificado' } },
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Olvidé contraseña',
    description: 'Solicita reseteo de contraseña via email',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Email de reseteo enviado',
    schema: { example: { message: 'Token de reseteo enviado', resetToken: '...' } },
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string; resetToken?: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resetear contraseña',
    description: 'Resetea contraseña usando token de reset',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Contraseña reseteada',
    schema: { example: { message: 'Contraseña actualizada' } },
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
