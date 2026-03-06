import { CosmosClient, Database, Container } from '@azure/cosmos';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Servicio de Conexión a Azure Cosmos DB
 *
 * Capa de Infraestructura - Database Connection Service
 *
 * Responsabilidades:
 * - Establecer y mantener la conexión con Azure Cosmos DB
 * - Proporcionar acceso a la database y containers
 * - Manejar la inicialización y verificación de recursos
 * - Logging de operaciones de conexión
 *
 * @injectable
 */
@Injectable()
export class CosmosDbService implements OnModuleInit {
  private readonly logger = new Logger(CosmosDbService.name);
  private client: CosmosClient;
  private database: Database;

  // Containers disponibles
  private usersContainer: Container;
  private postsContainer: Container;

  constructor(private configService: ConfigService) {}

  /**
   * Inicialización del módulo
   * Se ejecuta automáticamente cuando el módulo se carga
   */
  async onModuleInit() {
    await this.connect();
  }

  /**
   * Establece la conexión con Azure Cosmos DB
   * @private
   */
  private async connect(): Promise<void> {
    try {
      const endpoint = this.configService.get<string>('cosmosDb.endpoint');
      const key = this.configService.get<string>('cosmosDb.key');
      const databaseId = this.configService.get<string>('cosmosDb.database');

      if (!endpoint || !key) {
        throw new Error(
          'Cosmos DB credentials not configured. Check COSMOS_DB_ENDPOINT and COSMOS_DB_KEY in .env',
        );
      }

      this.logger.log('Connecting to Azure Cosmos DB...');

      // Crear cliente de Cosmos DB
      this.client = new CosmosClient({ endpoint, key });

      // Verificar conexión obteniendo información de la cuenta
      const { resource: account } = await this.client.getDatabaseAccount();
      this.logger.log(
        `Connected to Cosmos DB account in region: ${account.writableLocations[0]?.name || 'Unknown'}`,
      );

      // Obtener referencia a la database
      const { database } = await this.client.databases.createIfNotExists({
        id: databaseId,
      });
      this.database = database;
      this.logger.log(`Database "${databaseId}" ready`);

      // Inicializar containers
      await this.initializeContainers();

      this.logger.log('✅ Cosmos DB connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Cosmos DB', error.stack);
      throw error;
    }
  }

  /**
   * Inicializa los containers necesarios
   * @private
   */
  private async initializeContainers(): Promise<void> {
    // Container de Users
    const { container: users } = await this.database.containers.createIfNotExists({
      id: 'users',
      partitionKey: { paths: ['/id'] },
    });
    this.usersContainer = users;
    this.logger.log('Container "users" ready');

    // Container de Posts
    const { container: posts } = await this.database.containers.createIfNotExists({
      id: 'posts',
      partitionKey: { paths: ['/id'] },
    });
    this.postsContainer = posts;
    this.logger.log('Container "posts" ready');
  }

  /**
   * Obtiene el cliente de Cosmos DB
   * @returns {CosmosClient} Cliente de Cosmos DB
   */
  getClient(): CosmosClient {
    if (!this.client) {
      throw new Error('Cosmos DB client not initialized');
    }
    return this.client;
  }

  /**
   * Obtiene la database
   * @returns {Database} Instancia de la database
   */
  getDatabase(): Database {
    if (!this.database) {
      throw new Error('Cosmos DB database not initialized');
    }
    return this.database;
  }

  /**
   * Obtiene el container de Users
   * @returns {Container} Container de usuarios
   */
  getUsersContainer(): Container {
    if (!this.usersContainer) {
      throw new Error('Users container not initialized');
    }
    return this.usersContainer;
  }

  /**
   * Obtiene el container de Posts
   * @returns {Container} Container de posts
   */
  getPostsContainer(): Container {
    if (!this.postsContainer) {
      throw new Error('Posts container not initialized');
    }
    return this.postsContainer;
  }

  /**
   * Obtiene un container específico por nombre
   * @param {string} containerId - ID del container
   * @returns {Container} Container solicitado
   */
  getContainer(containerId: string): Container {
    if (!this.database) {
      throw new Error('Cosmos DB database not initialized');
    }
    return this.database.container(containerId);
  }

  /**
   * Verifica el estado de la conexión
   * @returns {Promise<boolean>} True si la conexión está activa
   */
  async isConnected(): Promise<boolean> {
    try {
      if (!this.client) {
        return false;
      }
      await this.client.getDatabaseAccount();
      return true;
    } catch (error) {
      this.logger.error('Connection check failed', error.stack);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de uso (útil para monitoreo)
   * @returns {Promise<any>} Estadísticas de la database
   */
  async getDatabaseStats(): Promise<any> {
    try {
      const { resource: dbInfo } = await this.database.read();
      return {
        id: dbInfo.id,
        _self: dbInfo._self,
        _rid: dbInfo._rid,
        _ts: dbInfo._ts,
        _etag: dbInfo._etag,
      };
    } catch (error) {
      this.logger.error('Failed to get database stats', error.stack);
      throw error;
    }
  }
}
