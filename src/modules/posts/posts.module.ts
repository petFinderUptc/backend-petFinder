/**
 * Módulo de Publicaciones
 *
 * Módulo de NestJS que orquesta las dependencias del contexto de publicaciones.
 * Conecta Controllers (Presentación) → Services (Aplicación) → Repositories (Infraestructura)
 */

import { Module } from '@nestjs/common';
import { PostsController } from '../../presentation/controllers';
import { PostsService } from '../../application/services';
import { InMemoryPostRepository } from '../../infrastructure/database/in-memory';

@Module({
  controllers: [PostsController],
  providers: [
    PostsService,
    {
      provide: 'IPostRepository',
      useClass: InMemoryPostRepository,
    },
  ],
  exports: [PostsService],
})
export class PostsModule {}
