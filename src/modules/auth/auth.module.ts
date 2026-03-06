/**
 * Módulo de autenticación
 *
 * Configura JWT y passport para autenticación.
 *
 * Componentes implementados:
 * - JwtModule: Generación y validación de tokens JWT
 * - JwtStrategy: Estrategia de validación de tokens
 * - AuthService: Lógica de negocio de autenticación
 * - AuthController: Endpoints de autenticación
 *
 * FASE 2: Implementar
 * - LocalStrategy para login con usuario/contraseña
 * - Refresh tokens
 * - 2FA (autenticación de dos factores)
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '../../presentation/controllers';
import { AuthService } from '../../application/services';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from '../../presentation/strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule, // Importar para usar UsersService
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Configuración JWT con variables de entorno
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // ✅ Registrar JwtStrategy
    // PasswordHashService se importa automáticamente desde UsersModule
    // TODO: FASE 2 - Agregar strategies adicionales
    // LocalStrategy,
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
