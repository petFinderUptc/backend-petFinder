import { CosmosClient, Database, Container } from '@azure/cosmos';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CosmosDbService implements OnModuleInit {
  private readonly logger = new Logger(CosmosDbService.name);
  private client: CosmosClient;
  private database: Database;
  private usersContainer: Container;
  private postsContainer: Container;
  private notificationsContainer: Container;
  private reportsContainer: Container;
  private imagesContainer: Container;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      await this.connect();
    } catch (error) {
      this.logger.error('Failed to initialize Cosmos DB connection');
      this.logger.error('⚠️  Application will start but database operations will fail');
      this.logger.error('🔍 Check COSMOS_DB_ENDPOINT, COSMOS_DB_KEY, and COSMOS_DB_DATABASE');
      // No lanzar error aquí para que la app pueda iniciar y mostrar endpoints de diagnóstico
    }
  }

  private async connect(): Promise<void> {
    const endpoint = this.configService.get<string>('cosmosDb.endpoint');
    const key = this.configService.get<string>('cosmosDb.key');
    const databaseId = this.configService.get<string>('cosmosDb.database');

    if (!endpoint || !key) {
      const errorMsg =
        'Cosmos DB credentials not configured. Missing COSMOS_DB_ENDPOINT or COSMOS_DB_KEY';
      this.logger.error(`❌ ${errorMsg}`);
      throw new Error(errorMsg);
    }

    this.logger.log('🔌 Connecting to Azure Cosmos DB...');
    this.logger.log(`📍 Endpoint: ${endpoint}`);
    this.logger.log(`📦 Database: ${databaseId}`);

    this.client = new CosmosClient({ endpoint, key });

    try {
      const { resource: account } = await this.client.getDatabaseAccount();
      this.logger.log(
        `✅ Connected to Cosmos DB account in region: ${account.writableLocations[0]?.name || 'Unknown'}`,
      );

      const { database } = await this.client.databases.createIfNotExists({
        id: databaseId,
      });
      this.database = database;
      this.logger.log(`📦 Database "${databaseId}" is ready`);

      await this.initializeContainers();

      this.logger.log('✅ Cosmos DB connection established successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Cosmos DB', error.message);
      this.logger.error('🔍 Possible causes:');
      this.logger.error('   1. Invalid COSMOS_DB_KEY');
      this.logger.error('   2. Cosmos DB firewall blocking Azure App Service IP');
      this.logger.error('   3. Network connectivity issues');
      throw error;
    }
  }

  private async initializeContainers(): Promise<void> {
    const { container: users } = await this.database.containers.createIfNotExists({
      id: 'users',
      partitionKey: {
        paths: ['/email'],
        version: 2,
      },
      uniqueKeyPolicy: {
        uniqueKeys: [{ paths: ['/username'] }, { paths: ['/email'] }],
      },
      indexingPolicy: {
        indexingMode: 'consistent',
        automatic: true,
        includedPaths: [{ path: '/*' }],
        excludedPaths: [{ path: '/"_etag"/?' }],
        compositeIndexes: [
          [
            { path: '/username', order: 'ascending' },
            { path: '/createdAt', order: 'descending' },
          ],
          [
            { path: '/role', order: 'ascending' },
            { path: '/createdAt', order: 'descending' },
          ],
          [
            { path: '/isActive', order: 'ascending' },
            { path: '/updatedAt', order: 'descending' },
          ],
        ],
      },
    });
    this.usersContainer = users;
    this.logger.log('Container "users" ready with unique keys and optimized indexing policy');

    const { container: posts } = await this.database.containers.createIfNotExists({
      id: 'posts',
      partitionKey: { paths: ['/id'] },
    });
    this.postsContainer = posts;
    this.logger.log('Container "posts" ready');

    const { container: notifications } = await this.database.containers.createIfNotExists({
      id: 'notifications',
      partitionKey: { paths: ['/userId'] },
      indexingPolicy: {
        indexingMode: 'consistent',
        automatic: true,
        includedPaths: [{ path: '/*' }],
        excludedPaths: [{ path: '/"_etag"/?' }],
      },
    });
    this.notificationsContainer = notifications;
    this.logger.log('Container "notifications" ready');

    const { container: reports } = await this.database.containers.createIfNotExists({
      id: 'reports',
      partitionKey: { paths: ['/id'] },
      indexingPolicy: {
        indexingMode: 'consistent',
        automatic: true,
        includedPaths: [{ path: '/*' }],
        excludedPaths: [{ path: '/"_etag"/?' }],
        compositeIndexes: [
          [
            { path: '/status', order: 'ascending' },
            { path: '/createdAt', order: 'descending' },
          ],
          [
            { path: '/userId', order: 'ascending' },
            { path: '/createdAt', order: 'descending' },
          ],
          [
            { path: '/species', order: 'ascending' },
            { path: '/createdAt', order: 'descending' },
          ],
        ],
      },
    });
    this.reportsContainer = reports;
    this.logger.log('Container "reports" ready');

    const { container: images } = await this.database.containers.createIfNotExists({
      id: 'images',
      partitionKey: { paths: ['/userId'] },
      indexingPolicy: {
        indexingMode: 'consistent',
        automatic: true,
        includedPaths: [{ path: '/*' }],
        excludedPaths: [{ path: '/"_etag"/?' }],
        compositeIndexes: [
          [
            { path: '/userId', order: 'ascending' },
            { path: '/createdAt', order: 'descending' },
          ],
          [
            { path: '/folder', order: 'ascending' },
            { path: '/createdAt', order: 'descending' },
          ],
        ],
      },
    });
    this.imagesContainer = images;
    this.logger.log('Container "images" ready');
  }

  getClient(): CosmosClient {
    if (!this.client) {
      throw new Error('Cosmos DB client not initialized');
    }
    return this.client;
  }

  getDatabase(): Database {
    if (!this.database) {
      throw new Error('Cosmos DB database not initialized');
    }
    return this.database;
  }

  getUsersContainer(): Container {
    if (!this.usersContainer) {
      throw new Error('Users container not initialized');
    }
    return this.usersContainer;
  }

  getPostsContainer(): Container {
    if (!this.postsContainer) {
      throw new Error('Posts container not initialized');
    }
    return this.postsContainer;
  }

  getNotificationsContainer(): Container {
    if (!this.notificationsContainer) {
      throw new Error('Notifications container not initialized');
    }
    return this.notificationsContainer;
  }

  getReportsContainer(): Container {
    if (!this.reportsContainer) {
      throw new Error('Reports container not initialized');
    }
    return this.reportsContainer;
  }

  getImagesContainer(): Container {
    if (!this.imagesContainer) {
      throw new Error('Images container not initialized');
    }
    return this.imagesContainer;
  }

  getContainer(containerId: string): Container {
    if (!this.database) {
      throw new Error('Cosmos DB database not initialized');
    }
    return this.database.container(containerId);
  }

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
