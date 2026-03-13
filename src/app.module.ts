import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './infrastructure/config';
import { AppController } from './app.controller';
import { DatabaseModule } from './infrastructure/database';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    PostsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
