import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    logger.log('🚀 Starting PetFinder Backend API...');

    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);

    // Validar configuración crítica
    const nodeEnv = configService.get<string>('app.nodeEnv');
    const port = configService.get<number>('app.port');
    const apiPrefix = configService.get<string>('app.apiPrefix');
    const jwtSecret = configService.get<string>('jwt.secret');

    logger.log(`📊 Environment: ${nodeEnv}`);
    logger.log(`🔌 Port: ${port}`);
    logger.log(`🔗 API Prefix: /${apiPrefix}`);
    logger.log(`🔐 JWT Secret: ${jwtSecret ? '✓ Configured' : '✗ Missing'}`);

    // Configurar CORS
    const corsOrigins = configService.get<string[]>('cors.origins');
    logger.log(`🌐 CORS Origins: ${corsOrigins?.join(', ') || 'Not configured'}`);

    app.enableCors({
      origin: corsOrigins || '*',
      credentials: true,
    });

    // Configurar prefijo de API
    app.setGlobalPrefix(apiPrefix, {
      exclude: ['/', 'health', 'info', 'db-health'],
    });

    // Configurar validación global
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Iniciar servidor
    await app.listen(port, '0.0.0.0');

    logger.log('========================================');
    logger.log(`✅ PetFinder API is running!`);
    logger.log(`📍 Local: http://localhost:${port}`);
    logger.log(`📍 Network: http://0.0.0.0:${port}`);
    logger.log(`📍 Health: http://localhost:${port}/health`);
    logger.log(`📍 Info: http://localhost:${port}/info`);
    logger.log(`📍 API: http://localhost:${port}/${apiPrefix}`);
    logger.log('========================================');
  } catch (error) {
    logger.error('❌ Failed to start application', error.stack);
    logger.error('🔍 Please check:');
    logger.error('   1. All environment variables are configured');
    logger.error('   2. Cosmos DB credentials are correct');
    logger.error('   3. Port 8080 is available');
    process.exit(1);
  }
}

bootstrap();
