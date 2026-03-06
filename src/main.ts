import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const corsOrigins = configService.get<string[]>('cors.origins');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const apiPrefix = configService.get<string>('app.apiPrefix');
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['/', 'health', 'info'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<number>('app.port');
  await app.listen(port);

  console.log(`🐾 PetFinder API running on: http://localhost:${port}/${apiPrefix}`);
}

bootstrap();
