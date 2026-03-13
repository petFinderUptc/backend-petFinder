import { Module } from '@nestjs/common';
import { NotificationsController } from '../../presentation/controllers';
import { NotificationsService } from '../../application/services';
import { CosmosDbNotificationRepository, DatabaseModule } from '../../infrastructure/database';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    {
      provide: 'INotificationRepository',
      useClass: CosmosDbNotificationRepository,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
