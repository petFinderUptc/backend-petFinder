import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '../../presentation/controllers';
import { AuthService } from '../../application/services';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from '../../presentation/strategies/jwt.strategy';
import { RefreshTokenSessionService } from '../../application/services/refresh-token-session.service';
import { DatabaseModule, CosmosDbUserRepository } from '../../infrastructure/database';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenSessionService,
    {
      provide: 'IUserRepository',
      useClass: CosmosDbUserRepository,
    },
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
