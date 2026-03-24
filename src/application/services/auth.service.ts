import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  LogoutDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../dtos/auth';
import { PasswordHashService } from './password-hash.service';
import { RefreshTokenSessionService } from './refresh-token-session.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordHashService: PasswordHashService,
    private readonly refreshTokenSessionService: RefreshTokenSessionService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create(registerDto);
    const tokenPair = await this.refreshTokenSessionService.issueTokenPair(user.id, user.email);

    return new AuthResponseDto({
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenType: tokenPair.tokenType,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await this.passwordHashService.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const tokenPair = await this.refreshTokenSessionService.issueTokenPair(user.id, user.email);

    return new AuthResponseDto({
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenType: tokenPair.tokenType,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!token) {
      throw new BadRequestException('Refresh token requerido');
    }

    const tokenPair = await this.refreshTokenSessionService.rotateTokenPair(token);
    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };
  }

  async logout(logoutDto?: LogoutDto): Promise<{ message: string }> {
    const refreshToken = logoutDto?.token ?? logoutDto?.refreshToken;
    await this.refreshTokenSessionService.revokeByToken(refreshToken);
    return { message: 'Sesion cerrada correctamente' };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; resetToken?: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    // Evita enumeración de usuarios
    if (!user) {
      return {
        message: 'Si el correo existe, recibirás instrucciones para restablecer la contraseña',
      };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, purpose: 'password_reset' },
      { expiresIn: '15m' },
    );

    return {
      message: 'Token de restablecimiento generado',
      resetToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.token);
    } catch {
      throw new BadRequestException('Token de restablecimiento inválido o expirado');
    }

    if (payload.purpose !== 'password_reset') {
      throw new BadRequestException('Token de restablecimiento inválido');
    }

    const user = await this.usersService.findByEmail(payload.email);
    if (!user || !user.isActive) {
      throw new BadRequestException('Usuario inválido para restablecer contraseña');
    }

    const hashedPassword = await this.passwordHashService.hash(dto.newPassword);
    await this.usersService.updatePasswordHash(user.id, hashedPassword);

    return { message: 'Contrasena restablecida correctamente' };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.token);
    } catch {
      throw new BadRequestException('Token de verificación inválido o expirado');
    }

    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado para verificación');
    }

    await this.usersService.markEmailAsVerified(user.id);
    return { message: 'Correo verificado correctamente' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.refreshTokenSessionService.revokeAllByUser(userId);
    return { message: 'Todas las sesiones del usuario fueron cerradas' };
  }
}
