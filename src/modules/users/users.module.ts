import { Module } from '@nestjs/common';
import { UsersController } from '../../presentation/controllers';
import { UsersService, PasswordHashService } from '../../application/services';
import { InMemoryUserRepository } from '../../infrastructure/database/in-memory';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    PasswordHashService,
    {
      provide: 'IUserRepository',
      useClass: InMemoryUserRepository,
    },
  ],
  exports: [UsersService, PasswordHashService],
})
export class UsersModule {}
