import { Module } from '@nestjs/common';
import { PostsController } from '../../presentation/controllers';
import { PostsService } from '../../application/services';
import { CosmosDbPostRepository, DatabaseModule } from '../../infrastructure/database';
import { NotificationsModule } from '../notifications/notifications.module';
import { AzureStorageModule } from '../../infrastructure/external-services/azure';

@Module({
  imports: [DatabaseModule, NotificationsModule, AzureStorageModule],
  controllers: [PostsController],
  providers: [
    PostsService,
    {
      provide: 'IPostRepository',
      useClass: CosmosDbPostRepository,
    },
  ],
  exports: [PostsService],
})
export class PostsModule {}
