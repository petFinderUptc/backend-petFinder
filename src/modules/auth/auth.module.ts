/**
 * Módulo de autenticación
 *
 * Configura JWT y passport para autenticación.
 *
 * FASE 2: Implementar
 * - JwtStrategy para validación de tokens
 * - LocalStrategy para login con usuario/contraseña
 * - Guards personalizados (JwtAuthGuard, RolesGuard)
 * - Decorators personalizados (@CurrentUser, @Roles)
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '../../presentation/controllers';
import { AuthService } from '../../application/services';
import { UsersModule } from '../users/users.module';

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
    // TODO: FASE 2 - Agregar strategies
    // JwtStrategy,
    // LocalStrategy,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
