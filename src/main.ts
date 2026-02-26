/**
 * Punto de entrada principal de la aplicación NestJS
 *
 * Configura:
 * - Puerto del servidor
 * - CORS
 * - Prefijo global de API
 * - Validación global de DTOs
 *
 * FASE FUTURA: Agregar
 * - Helmet para seguridad
 * - Swagger/OpenAPI documentation
 * - Compression middleware
 * - Logger personalizado (Winston)
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obtener servicio de configuración
  const configService = app.get(ConfigService);

  // Configurar CORS
  const corsOrigins = configService.get<string[]>('cors.origins');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Prefijo global para todas las rutas
  const apiPrefix = configService.get<string>('app.apiPrefix');
  app.setGlobalPrefix(apiPrefix);

  // Validación global con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve propiedades no definidas en DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extras
      transform: true, // Transforma payloads a instancias de DTO
    }),
  );

  // TODO: FASE 2 - Agregar Swagger
  // const config = new DocumentBuilder()
  //   .setTitle('PetFinder API')
  //   .setDescription('API para búsqueda de mascotas perdidas')
  //   .setVersion('1.0')
  //   .addBearerAuth()
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('app.port');
  await app.listen(port);

  console.log(`🐾 PetFinder API running on: http://localhost:${port}/${apiPrefix}`);
}

bootstrap();
