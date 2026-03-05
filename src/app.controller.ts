/**
 * Controlador raíz de la aplicación
 *
 * Proporciona endpoints básicos para verificar el estado del servidor
 * y obtener información general de la API.
 */

import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Health check endpoint
   * Verifica que el servidor está funcionando correctamente
   *
   * @returns Estado del servidor y metadatos básicos
   */
  @Get()
  getHealthCheck() {
    const environment = this.configService.get<string>('app.nodeEnv');
    const apiPrefix = this.configService.get<string>('app.apiPrefix');
    const port = this.configService.get<number>('app.port');

    return {
      status: 'ok',
      message: 'PetFinder Backend API is running',
      timestamp: new Date().toISOString(),
      environment,
      apiPrefix: `/${apiPrefix}`,
      port,
      documentation: {
        readme: 'https://github.com/jhoncastro28/backend-petFinder/blob/feature/ARQ/README.md',
        architecture:
          'https://github.com/jhoncastro28/backend-petFinder/blob/feature/ARQ/docs/ARQUITECTURA-CAPAS.md',
      },
      endpoints: {
        auth: `/${apiPrefix}/auth`,
        users: `/${apiPrefix}/users`,
        posts: `/${apiPrefix}/posts`,
      },
    };
  }

  /**
   * Endpoint alternativo de health check
   * Útil para balanceadores de carga y monitoreo
   *
   * @returns Estado simplificado del servidor
   */
  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Endpoint de información de la API
   *
   * @returns Información detallada de la API
   */
  @Get('info')
  getInfo() {
    const apiPrefix = this.configService.get<string>('app.apiPrefix');

    return {
      name: 'PetFinder Backend API',
      description: 'API REST para plataforma de búsqueda y reencuentro de mascotas perdidas',
      version: '1.0.0',
      apiPrefix: `/${apiPrefix}`,
      environment: this.configService.get<string>('app.nodeEnv'),
      architecture: 'Clean Architecture + Domain-Driven Design (DDD)',
      layers: {
        domain: 'Entities, Value Objects, Repository Interfaces',
        application: 'Services, DTOs, Use Cases',
        infrastructure: 'Repository Implementations, External Services',
        presentation: 'Controllers, Guards, Decorators',
      },
      features: [
        'JWT Authentication',
        'User Management',
        'Post Management (Lost/Found Pets)',
        'Role-based Authorization',
        'Input Validation',
      ],
      team: 'PetFinder Team - UPTC',
    };
  }
}
