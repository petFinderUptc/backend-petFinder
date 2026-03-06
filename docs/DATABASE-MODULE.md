# 🔌 Módulo de Conexión a Azure Cosmos DB - NestJS

## ✅ Implementación Completada

Este documento describe el módulo de conexión a Azure Cosmos DB implementado en NestJS.

## 🔑 Configuración de Contenedores

### Contenedor: **users**
- **Partition Key**: `/email` (optimizado para distribución uniforme)
- **Política de Índices**: Configurada con índices compuestos
- **Documentación detallada**: Ver [INDEXING-POLICY.md](./INDEXING-POLICY.md)

### Contenedor: **posts**  
- **Partition Key**: `/id`

---

## 📦 Archivos Creados

### 1. Servicio de Cosmos DB
**Ubicación**: `src/infrastructure/database/cosmosdb.service.ts`

Servicio injectable que maneja:
- ✅ Conexión automática a Cosmos DB al iniciar la aplicación
- ✅ Gestión del cliente de Cosmos DB
- ✅ Acceso a database y containers
- ✅ Logging de operaciones
- ✅ Health checks

### 2. Módulo de Database
**Ubicación**: `src/infrastructure/database/database.module.ts`

Módulo global que:
- ✅ Exporta `CosmosDbService` 
- ✅ Se registra globalmente con `@Global()`
- ✅ Disponible en toda la aplicación sin necesidad de importarlo

### 3. Exports
**Ubicación**: `src/infrastructure/database/index.ts`

Barrel export para facilitar imports.

---

## 🔧 Configuración

### Variables de Entorno (.env)

```env
COSMOS_DB_ENDPOINT=https://petfinder-cosmosdb.documents.azure.com:443/
COSMOS_DB_KEY=tu_primary_key_aqui
COSMOS_DB_DATABASE=petfinder
```

### Configuración (configuration.ts)

```typescript
cosmosDb: {
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY,
  database: process.env.COSMOS_DB_DATABASE || 'petfinder',
}
```

---

## 📋 Características del Servicio

### Inicialización Automática

El servicio implementa `OnModuleInit`, lo que significa que:
1. Se conecta automáticamente al iniciar la aplicación
2. Crea la database si no existe
3. Crea los containers `users` y `posts` si no existen
4. Loguea todas las operaciones

### Métodos Disponibles

```typescript
// Obtener el cliente de Cosmos DB
getClient(): CosmosClient

// Obtener la database
getDatabase(): Database

// Obtener container de users
getUsersContainer(): Container

// Obtener container de posts
getPostsContainer(): Container

// Obtener cualquier container por nombre
getContainer(containerId: string): Container

// Verificar conexión
isConnected(): Promise<boolean>

// Obtener estadísticas de la database
getDatabaseStats(): Promise<any>
```

---

## 🎯 Uso en Otros Módulos

### Inyección en Servicios

Como el módulo es `@Global()`, puedes inyectarlo directamente sin importar el módulo:

```typescript
import { Injectable } from '@nestjs/common';
import { CosmosDbService } from '@infrastructure/database';

@Injectable()
export class UsersService {
  constructor(private readonly cosmosDbService: CosmosDbService) {}

  async findAll() {
    const container = this.cosmosDbService.getUsersContainer();
    
    const { resources } = await container.items
      .query('SELECT * FROM c')
      .fetchAll();
    
    return resources;
  }

  async create(user: any) {
    const container = this.cosmosDbService.getUsersContainer();
    
    const { resource } = await container.items.create(user);
    
    return resource;
  }
}
```

### Ejemplo Completo: Repository Pattern

```typescript
// src/infrastructure/repositories/cosmos-user.repository.ts
import { Injectable } from '@nestjs/common';
import { CosmosDbService } from '@infrastructure/database';
import { IUserRepository } from '@domain/repositories/user-repository.interface';
import { User } from '@domain/entities/user.entity';

@Injectable()
export class CosmosUserRepository implements IUserRepository {
  constructor(private readonly cosmosDbService: CosmosDbService) {}

  async create(user: User): Promise<User> {
    const container = this.cosmosDbService.getUsersContainer();
    
    const userDoc = {
      id: user.id,
      email: user.email, // Partition key
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role,
      isActive: true,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    // El email es el partition key
    const { resource } = await container.items.create(userDoc);
    
    return this.mapToEntity(resource);
  }

  async findById(id: string): Promise<User | null> {
    const container = this.cosmosDbService.getUsersContainer();
    
    // Como el partition key es /email, necesitamos una query
    const query = 'SELECT * FROM c WHERE c.id = @id';
    const { resources } = await container.items
      .query({
        query,
        parameters: [{ name: '@id', value: id }],
      })
      .fetchAll();

    return resources.length > 0 ? this.mapToEntity(resources[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const container = this.cosmosDbService.getUsersContainer();
    
    // Optimizado: usar query con partition key para lectura eficiente
    const query = 'SELECT * FROM c WHERE c.email = @email';
    const { resources } = await container.items
      .query({
        query,
        parameters: [{ name: '@email', value: email }],
      })
      .fetchAll();

    return resources.length > 0 ? this.mapToEntity(resources[0]) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const container = this.cosmosDbService.getUsersContainer();
    
    // Aprovecha índice compuesto username + createdAt
    const query = `
      SELECT * FROM c 
      WHERE c.username = @username
      ORDER BY c.createdAt DESC
    `;
    const { resources } = await container.items
      .query({
        query,
        parameters: [{ name: '@username', value: username }],
      })
      .fetchAll();

    return resources.length > 0 ? this.mapToEntity(resources[0]) : null;
  }

  async findByRole(role: string): Promise<User[]> {
    const container = this.cosmosDbService.getUsersContainer();
    
    // Aprovecha índice compuesto role + createdAt
    const query = `
      SELECT * FROM c 
      WHERE c.role = @role
      ORDER BY c.createdAt DESC
    `;
    const { resources } = await container.items
      .query({
        query,
        parameters: [{ name: '@role', value: role }],
      })
      .fetchAll();

    return resources.map((doc) => this.mapToEntity(doc));
  }

  async findAll(): Promise<User[]> {
    const container = this.cosmosDbService.getUsersContainer();
    
    const { resources } = await container.items
      .query('SELECT * FROM c ORDER BY c.createdAt DESC')
      .fetchAll();

    return resources.map((doc) => this.mapToEntity(doc));
  }

  async update(id: string, email: string, userData: Partial<User>): Promise<User> {
    const container = this.cosmosDbService.getUsersContainer();
    
    // Necesitamos el email (partition key) para operaciones item directas
    const { resource: existing } = await container.item(id, email).read();
    
    const updated = {
      ...existing,
      ...userData,
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await container.item(id, email).replace(updated);
    
    return this.mapToEntity(resource);
  }

  async delete(id: string, email: string): Promise<void> {
    const container = this.cosmosDbService.getUsersContainer();
    
    // Necesitamos el email (partition key) para eliminar
    await container.item(id, email).delete();
  }

  private mapToEntity(doc: any): User {
    return new User(
      doc.id,
      doc.email,
      doc.name,
      doc.username,
      doc.password,
      doc.role,
      doc.isActive,
      new Date(doc.createdAt),
      new Date(doc.updatedAt),
    );
  }
}
```

**⚠️ Nota Importante sobre Partition Key:**

El contenedor `users` usa `/email` como partition key, lo que significa:

- ✅ **Búsquedas por email son extremadamente eficientes** (single-partition query)
- ✅ **Distribución uniforme** de datos (cada email es único)
- ⚠️ **Operaciones directas** (read, replace, delete) **requieren el email** además del ID
- ⚠️ **Búsquedas por ID requieren query** (cross-partition) si no se conoce el email

**Mejores Prácticas:**
1. Siempre que sea posible, usa el email para operaciones CRUD
2. Para `update` y `delete`, pasa tanto el `id` como el `email`
3. Aprovecha los índices compuestos para queries frecuentes (username, role, isActive)
4. Ver [INDEXING-POLICY.md](./INDEXING-POLICY.md) para detalles sobre optimización

---

## 🔍 Health Check Endpoint

Se agregó un nuevo endpoint para verificar la conexión a la base de datos:

### GET /api/v1/db-health

**Response (Success):**
```json
{
  "status": "connected",
  "database": "petfinder",
  "timestamp": "2026-03-05T22:50:03.000Z",
  "details": {
    "resourceId": "fd0FAA==",
    "lastModified": "2026-03-05T22:45:00.000Z",
    "etag": "\"0000d60b-0000-0300-0000-65e7a8ec0000\""
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Connection failed: ...",
  "timestamp": "2026-03-05T22:50:03.000Z"
}
```

---

## 🧪 Scripts de Prueba

### 1. Probar Conexión a Cosmos DB

```bash
npm run test:cosmosdb
```

Verifica:
- ✅ Credenciales configuradas
- ✅ Conexión a Azure establecida
- ✅ Database y containers accesibles
- ✅ Lectura y escritura funcionando

### 2. Probar Health Endpoints

```bash
npm run test:health
```

Verifica:
- ✅ GET / (main health check)
- ✅ GET /health (simple health)
- ✅ GET /info (API info)
- ✅ GET /api/v1/db-health (database health)

---

## 📊 Logs de Inicio

Cuando la aplicación inicia, verás:

```
[Nest] LOG [CosmosDbService] Connecting to Azure Cosmos DB...
[Nest] LOG [CosmosDbService] Connected to Cosmos DB account in region: West US 2
[Nest] LOG [CosmosDbService] Database "petfinder" ready
[Nest] LOG [CosmosDbService] Container "users" ready
[Nest] LOG [CosmosDbService] Container "posts" ready
[Nest] LOG [CosmosDbService] ✅ Cosmos DB connection established successfully
```

---

## 🔐 Seguridad

### Mejores Prácticas Implementadas

1. **Variables de entorno**: Credenciales en `.env`, nunca hardcodeadas
2. **Validación**: El servicio valida que las credenciales existan
3. **Error handling**: Manejo robusto de errores de conexión
4. **Logging**: Todas las operaciones importantes se loguean
5. **Singleton**: Una sola conexión compartida (eficiente)

### NO hacer:

```typescript
// ❌ MAL: Hardcodear credenciales
const client = new CosmosClient({ 
  endpoint: 'https://...', 
  key: 'SIYQjrm...' 
});

// ✅ BIEN: Usar el servicio inyectable
constructor(private cosmosDbService: CosmosDbService) {}
```

---

## 🚀 Próximos Pasos

Para integrar completamente Cosmos DB en tu aplicación:

### 1. Migrar Repositorios In-Memory

Crear repositorios específicos para Cosmos DB:
- `CosmosUserRepository` → implementa `IUserRepository`
- `CosmosPostRepository` → implementa `IPostRepository`

### 2. Actualizar Módulos

Cambiar los providers en `users.module.ts` y `posts.module.ts`:

```typescript
// Antes (In-Memory)
{
  provide: 'IUserRepository',
  useClass: InMemoryUserRepository,
}

// Después (Cosmos DB)
{
  provide: 'IUserRepository',
  useClass: CosmosUserRepository,
}
```

### 3. Tests

- Crear mocks del `CosmosDbService` para tests unitarios
- Crear tests de integración con Cosmos DB real

---

## 📚 Recursos

- [Documentación @azure/cosmos](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/cosmosdb/cosmos)
- [Cosmos DB SQL Queries](https://docs.microsoft.com/en-us/azure/cosmos-db/sql-query-getting-started)
- [NestJS Custom Providers](https://docs.nestjs.com/fundamentals/custom-providers)
- [Clean Architecture with NestJS](https://docs.nestjs.com/techniques/mongodb#async-configuration)

---

## ✅ Checklist de Implementación

- [x] SDK @azure/cosmos instalado
- [x] Variables de entorno configuradas
- [x] Configuración actualizada (configuration.ts)
- [x] Servicio CosmosDbService creado
- [x] Módulo DatabaseModule creado
- [x] Módulo registrado en AppModule
- [x] Health check endpoint implementado
- [x] Scripts de prueba creados
- [x] Conexión verificada exitosamente
- [x] Documentación completa
- [ ] Repositorios migrados (próximo paso)
- [ ] Tests de integración (próximo paso)

---

**Fecha de implementación**: 5 de marzo de 2026  
**Estado**: ✅ Completamente funcional  
**Autor**: Implementado con Clean Architecture principles
