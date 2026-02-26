/**
 * Módulo de usuarios
 *
 * Gestiona toda la funcionalidad relacionada con usuarios del sistema.
 *
 * Exporta UsersService para que pueda ser usado por AuthModule
 */

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exportar para uso en AuthModule
})
export class UsersModule {}
