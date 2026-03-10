import { Module } from '@nestjs/common';
import { UsersController } from '../../presentation/controllers';
import { UsersService, PasswordHashService } from '../../application/services';
import { CosmosDbUserRepository, DatabaseModule } from '../../infrastructure/database';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    PasswordHashService,
    {
      provide: 'IUserRepository',
      useClass: CosmosDbUserRepository,
    },
  ],
  exports: [UsersService, PasswordHashService],
})
export class UsersModule {}
