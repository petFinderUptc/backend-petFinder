import { Module } from '@nestjs/common';
import { UsersController } from '../../presentation/controllers';
import { UsersService, PasswordHashService } from '../../application/services';
import {
  CosmosDbUserRepository,
  DatabaseModule,
  CosmosDbPostRepository,
} from '../../infrastructure/database';
import { AzureStorageModule } from '../../infrastructure/external-services/azure';

@Module({
  imports: [DatabaseModule, AzureStorageModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    PasswordHashService,
    {
      provide: 'IUserRepository',
      useClass: CosmosDbUserRepository,
    },
    {
      provide: 'IPostRepository',
      useClass: CosmosDbPostRepository,
    },
  ],
  exports: [UsersService, PasswordHashService],
})
export class UsersModule {}
