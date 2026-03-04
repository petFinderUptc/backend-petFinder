/**
 * Módulo de Usuarios
 *
 * Módulo de NestJS que orquesta las dependencias del contexto de usuarios.
 * Conecta Controllers (Presentación) → Services (Aplicación) → Repositories (Infraestructura)
 */

import { Module } from '@nestjs/common';
import { UsersController } from '../../presentation/controllers';
import { UsersService } from '../../application/services';
import { InMemoryUserRepository } from '../../infrastructure/database/in-memory';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'IUserRepository',
      useClass: InMemoryUserRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
