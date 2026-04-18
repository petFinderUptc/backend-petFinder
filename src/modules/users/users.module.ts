import { Module } from '@nestjs/common';
import { UsersController } from '../../presentation/controllers';
import { UsersService, PasswordHashService } from '../../application/services';
import { AdminSeedService } from '../../application/services/admin-seed.service';
import {
  CosmosDbUserRepository,
  DatabaseModule,
  CosmosDbReportRepository,
} from '../../infrastructure/database';
import { AzureStorageModule } from '../../infrastructure/external-services/azure';

@Module({
  imports: [DatabaseModule, AzureStorageModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    PasswordHashService,
    AdminSeedService,
    {
      provide: 'IUserRepository',
      useClass: CosmosDbUserRepository,
    },
    {
      provide: 'IReportRepository',
      useClass: CosmosDbReportRepository,
    },
  ],
  exports: [UsersService, PasswordHashService],
})
export class UsersModule {}
