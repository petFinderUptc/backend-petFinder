/**
 * Servicio de autenticación
 *
 * Maneja toda la lógica de autenticación:
 * - Registro de usuarios
 * - Login con validación de credenciales
 * - Generación de tokens JWT
 *
 * FASE 2: Implementar
 * - Refresh tokens
 * - Password reset
 * - Email verification
 * - 2FA (autenticación de dos factores)
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registrar un nuevo usuario
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Crear usuario usando el servicio de usuarios
    const user = await this.usersService.create(registerDto);

    // Generar token JWT
    const accessToken = this.generateToken(user.id, user.email);

    return new AuthResponseDto({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }

  /**
   * Login de usuario
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Buscar usuario por email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Generar token JWT
    const accessToken = this.generateToken(user.id, user.email);

    return new AuthResponseDto({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }

  /**
   * Validar token JWT
   * TODO: FASE 2 - Implementar validación completa con estrategia JWT
   */
  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  /**
   * Generar token JWT
   */
  private generateToken(userId: string, email: string): string {
    const payload = {
      sub: userId,
      email: email,
    };

    return this.jwtService.sign(payload);
  }

  // TODO: FASE 2 - Implementar métodos adicionales
  // async refreshToken(refreshToken: string): Promise<AuthResponseDto>
  // async forgotPassword(email: string): Promise<void>
  // async resetPassword(token: string, newPassword: string): Promise<void>
  // async verifyEmail(token: string): Promise<void>
}
