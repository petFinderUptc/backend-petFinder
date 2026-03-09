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
