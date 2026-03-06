/**
 * Configuración global de la aplicación
 *
 * Capa de Infraestructura - Configuración de variables de entorno
 *
 * Este archivo centraliza todas las variables de entorno y configuraciones
 * necesarias para el funcionamiento del backend.
 *
 * FASE FUTURA: Agregar configuraciones específicas para:
 * - Azure Cosmos DB
 * - Azure Blob Storage
 * - Redis (caché)
 * - SendGrid/Email services
 */

export default () => ({
  // Configuración de la aplicación
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    apiPrefix: process.env.API_PREFIX || 'api/v1',
  },

  // Configuración JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },

  // Configuración CORS
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4200'],
  },

  // Rate Limiting
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
  },

  // Configuración Azure Cosmos DB
  cosmosDb: {
    endpoint: process.env.COSMOS_DB_ENDPOINT,
    key: process.env.COSMOS_DB_KEY,
    database: process.env.COSMOS_DB_DATABASE || 'petfinder',
  },

  // TODO: FASE 2 - Configuración Azure Blob Storage
  // azureStorage: {
  //   connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  //   containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
  // },
});
