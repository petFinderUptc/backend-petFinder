/**
 * Módulo raíz de la aplicación
 *
 * Importa y configura todos los módulos principales del sistema.
 *
 * Arquitectura:
 * - ConfigModule: Gestión de variables de entorno
 * - AuthModule: Autenticación y autorización
 * - UsersModule: Gestión de usuarios
 * - PostsModule: Publicaciones de mascotas perdidas/encontradas
 *
 * FASE FUTURA: Agregar módulos de
 * - NotificationsModule (push, email, SMS)
 * - MatchingModule (algoritmo de coincidencias)
 * - MessagingModule (chat entre usuarios)
 * - GeolocationModule (mapas y ubicaciones)
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './infrastructure/config';

// Controladores raíz
import { AppController } from './app.controller';

// Módulos de infraestructura
import { DatabaseModule } from './infrastructure/database';

// Módulos de negocio
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // Módulo de base de datos (Global)
    DatabaseModule,

    // Módulos de funcionalidad
    AuthModule,
    UsersModule,
    PostsModule,

    // TODO: FASE 3 - Agregar módulos adicionales
    // NotificationsModule,
    // MatchingModule,
    // MessagingModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
