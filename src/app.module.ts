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

    // Módulos de funcionalidad
    AuthModule,
    UsersModule,
    PostsModule,

    // TODO: FASE 2 - Agregar módulo de base de datos
    // DatabaseModule,

    // TODO: FASE 3 - Agregar módulos adicionales
    // NotificationsModule,
    // MatchingModule,
    // MessagingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
