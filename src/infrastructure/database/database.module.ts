import { Module, Global } from '@nestjs/common';
import { CosmosDbService } from './cosmosdb.service';

/**
 * Módulo de Base de Datos
 *
 * Capa de Infraestructura - Database Module
 *
 * Este módulo proporciona acceso centralizado a Azure Cosmos DB
 * en toda la aplicación.
 *
 * Características:
 * - @Global decorator: Hace que el módulo esté disponible en toda la app
 * - Exports: CosmosDbService para que otros módulos puedan inyectarlo
 * - Singleton: Una sola conexión compartida por todos los módulos
 *
 * Uso en otros módulos:
 * ```typescript
 * constructor(private cosmosDbService: CosmosDbService) {}
 * ```
 *
 * @global
 */
@Global()
@Module({
  providers: [CosmosDbService],
  exports: [CosmosDbService],
})
export class DatabaseModule {}
