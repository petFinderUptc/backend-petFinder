# 🐾 PetFinder Backend API

Backend API para plataforma de búsqueda y reencuentro de mascotas perdidas.

## 📋 Descripción

PetFinder es una plataforma web diseñada para facilitar el reencuentro de mascotas perdidas con sus dueños. Este backend proporciona la API REST necesaria para gestionar publicaciones de mascotas perdidas/encontradas, usuarios, autenticación y futuras funcionalidades de matching automático.

## 🏗️ Arquitectura

El proyecto implementa **Clean Architecture** con **Domain-Driven Design (DDD)**, organizado en 4 capas independientes:

```
📦 src/
├── 🎨 presentation/        # Capa de Presentación (Controllers, Guards, Decorators)
├── 📋 application/         # Capa de Aplicación (Services, DTOs, Use Cases)
├── 💎 domain/              # Capa de Dominio (Entities, Value Objects, Business Rules)
└── 🔧 infrastructure/      # Capa de Infraestructura (Repositories, External Services)
```

### Flujo de Datos

```
HTTP Request → Controller → Service → Repository Interface → Repository Implementation → Data Source
                    ↓           ↓              ↑                       ↑
              Presentation  Application    Domain              Infrastructure
```

### Principios SOLID Aplicados
- ✅ **Single Responsibility**: Cada capa con una responsabilidad única
- ✅ **Dependency Inversion**: Las capas internas no dependen de las externas
- ✅ **Interface Segregation**: Contratos claros entre capas (IUserRepository, IPostRepository)
- ✅ **Separation of Concerns**: Lógica de negocio independiente del framework
- ✅ **Testability**: Cada capa puede probarse de forma aislada con mocks

📖 **Documentación detallada**: Ver [Arquitectura en Capas](docs/ARQUITECTURA-CAPAS.md)

## 🛠️ Stack Tecnológico

- **Framework**: NestJS 10.x
- **Lenguaje**: TypeScript 5.x
- **Arquitectura**: Clean Architecture + Domain-Driven Design (DDD)
- **Base de Datos**: Azure Cosmos DB (NoSQL) *(preparado para futura integración)*
- **Storage**: Azure Blob Storage *(preparado para futura integración)*
- **Autenticación**: JWT + Passport
- **Validación**: class-validator, class-transformer
- **Calidad de Código**: ESLint, Prettier, Husky, lint-staged
- **Testing**: Jest (unitarios y E2E)
- **CI/CD**: Azure DevOps *(preparado)*

## ✨ Características Principales

### 🔐 Autenticación y Autorización
- JWT (JSON Web Tokens) para autenticación stateless
- Guards personalizados (`JwtAuthGuard`, `RolesGuard`)
- Decoradores: `@CurrentUser()`, `@Roles()`
- Estrategia Passport JWT implementada
- Hash de contraseñas con bcrypt

### 👥 Gestión de Usuarios
- Registro y login de usuarios
- Roles: `ADMIN`, `USER`
- Perfiles de usuario completos
- Validación de email y datos
- Actualización de perfil

### 📝 Gestión de Publicaciones
- Crear publicaciones de mascotas perdidas/encontradas
- Tipos: `LOST` (perdida), `FOUND` (encontrada)
- Estados: `ACTIVE`, `RESOLVED`, `CLOSED`
- Información de mascota: tipo, tamaño, color, descripción
- Ubicación con coordenadas (Value Object)
- Imágenes (URLs preparadas para Azure Blob Storage)
- Filtrado por tipo y estado
- Marcar como resuelta

### 🎯 Patrones y Principios Implementados
- **Repository Pattern**: Interfaces en Domain, implementaciones en Infrastructure
- **Dependency Injection**: Inversión de dependencias con NestJS
- **DTOs**: Validación de entrada con class-validator
- **Entity Encapsulation**: Lógica de negocio dentro de entidades
- **Value Objects**: Objetos inmutables (Location)
- **Domain Events**: Preparado para eventos de dominio
- **CQRS**: Preparado para separación Command/Query

## 🎯 Calidad de Código

Este proyecto implementa herramientas automatizadas para mantener altos estándares de código:

### ESLint
Análisis estático de código para detectar errores y malas prácticas.

### Prettier
Formateador automático que asegura consistencia en el estilo del código.

### Husky + lint-staged
Pre-commit hooks que ejecutan automáticamente:
- ✅ ESLint con auto-fix
- ✅ Prettier para formateo

**Beneficio**: Todo código commiteado cumple automáticamente con los estándares del proyecto.

📖 Ver [Guía de Pre-commit Hooks](docs/PRE-COMMIT-HOOKS.md) para más detalles.

## 📁 Estructura del Proyecto

```
backend-petfinder/
├── src/
│   ├── 💎 domain/                      # Capa de Dominio
│   │   ├── entities/                   # Entidades de negocio
│   │   │   ├── user.entity.ts          # Entidad Usuario
│   │   │   └── post.entity.ts          # Entidad Publicación
│   │   ├── value-objects/              # Objetos de valor
│   │   │   └── location.vo.ts          # Value Object Ubicación
│   │   ├── enums/                      # Enumeraciones
│   │   │   ├── user-role.enum.ts       # Roles de usuario
│   │   │   ├── post-type.enum.ts       # Tipo de publicación
│   │   │   ├── post-status.enum.ts     # Estado de publicación
│   │   │   ├── pet-type.enum.ts        # Tipo de mascota
│   │   │   └── pet-size.enum.ts        # Tamaño de mascota
│   │   └── repositories/               # Interfaces de repositorios
│   │       ├── user.repository.interface.ts
│   │       └── post.repository.interface.ts
│   ├── 📋 application/                 # Capa de Aplicación
│   │   ├── services/                   # Servicios de casos de uso
│   │   │   ├── auth.service.ts         # Lógica de autenticación
│   │   │   ├── users.service.ts        # Lógica de usuarios
│   │   │   └── posts.service.ts        # Lógica de publicaciones
│   │   ├── dtos/                       # Data Transfer Objects
│   │   │   ├── auth/                   # DTOs de autenticación
│   │   │   ├── users/                  # DTOs de usuarios
│   │   │   └── posts/                  # DTOs de publicaciones
│   │   └── interfaces/                 # Interfaces de aplicación
│   │       └── api-response.interface.ts
│   ├── 🔧 infrastructure/              # Capa de Infraestructura
│   │   ├── database/                   # Implementaciones de persistencia
│   │   │   └── in-memory/              # Repositorios en memoria
│   │   │       ├── in-memory-user.repository.ts
│   │   │       └── in-memory-post.repository.ts
│   │   ├── config/                     # Configuración
│   │   │   └── configuration.ts        # Variables de entorno
│   │   └── external-services/          # Servicios externos (Azure, etc.)
│   ├── 🎨 presentation/                # Capa de Presentación
│   │   ├── controllers/                # Controladores HTTP
│   │   │   ├── auth.controller.ts
│   │   │   ├── users.controller.ts
│   │   │   └── posts.controller.ts
│   │   ├── guards/                     # Guards de autorización
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/                 # Decoradores personalizados
│   │   ├── filters/                    # Exception filters
│   │   ├── interceptors/               # Interceptores HTTP
│   │   ├── pipes/                      # Pipes de validación
│   │   └── strategies/                 # Estrategias Passport
│   ├── 🔌 modules/                     # Módulos NestJS (DI)
│   │   ├── auth/                       # Módulo de autenticación
│   │   ├── users/                      # Módulo de usuarios
│   │   └── posts/                      # Módulo de publicaciones
│   ├── app.module.ts                   # Módulo raíz
│   └── main.ts                         # Punto de entrada
├── docs/                               # Documentación
│   ├── ARQUITECTURA-CAPAS.md           # Guía de arquitectura detallada
│   └── PRE-COMMIT-HOOKS.md             # Guía de hooks
├── test/                               # Tests E2E
├── .env                                # Variables de entorno (local)
├── .env.example                        # Ejemplo de variables
└── package.json
```

### 🔍 Detalles de cada capa

#### 💎 Domain Layer (Capa de Dominio)
- **Propósito**: Lógica de negocio pura, independiente de frameworks
- **Contenido**: Entidades, Value Objects, Enums, Interfaces de repositorios
- **Dependencias**: Ninguna (capa más interna)
- **Ejemplo**: `User.entity.ts` con métodos como `isAdmin()`, `deactivate()`

#### 📋 Application Layer (Capa de Aplicación)
- **Propósito**: Orquestación de casos de uso, coordinación entre capas
- **Contenido**: Services, DTOs, Interfaces de aplicación
- **Dependencias**: Solo depende de Domain
- **Ejemplo**: `UsersService` que usa `IUserRepository` para crear usuarios

#### 🔧 Infrastructure Layer (Capa de Infraestructura)
- **Propósito**: Implementaciones técnicas, acceso a datos
- **Contenido**: Repositorios concretos, configuración, servicios externos
- **Dependencias**: Implementa interfaces de Domain
- **Ejemplo**: `InMemoryUserRepository` implementa `IUserRepository`

#### 🎨 Presentation Layer (Capa de Presentación)
- **Propósito**: Interfaz con el exterior (HTTP, validación, autenticación)
- **Contenido**: Controllers, Guards, Decorators, Filters, Pipes
- **Dependencias**: Usa services de Application
- **Ejemplo**: `UsersController` expone endpoints REST

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
```

## 🏃 Ejecutar la aplicación

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

La API estará disponible en `http://localhost:3000`

## 📝 Scripts disponibles

```bash
npm run start:dev      # Modo desarrollo con hot-reload
npm run build          # Compilar para producción
npm run lint           # Ejecutar ESLint con auto-fix
npm run format         # Formatear código con Prettier
npm run test           # Ejecutar tests unitarios
npm run test:e2e       # Ejecutar tests E2E
```

> **Nota**: Los pre-commit hooks ejecutan automáticamente `lint` y `format` en archivos modificados antes de cada commit.

## � Endpoints API

### 🔓 Autenticación
```
POST /api/v1/auth/register     # Registro de nuevo usuario
POST /api/v1/auth/login        # Login (devuelve JWT)
```

### 👤 Usuarios
```
GET    /api/v1/users/profile           # Obtener perfil del usuario autenticado
PUT    /api/v1/users/profile           # Actualizar perfil
GET    /api/v1/users/:id               # Obtener usuario por ID (Admin)
GET    /api/v1/users                   # Listar todos los usuarios (Admin)
PUT    /api/v1/users/:id               # Actualizar usuario (Admin)
DELETE /api/v1/users/:id               # Eliminar usuario (Admin)
```

### 📝 Publicaciones
```
POST   /api/v1/posts                   # Crear publicación
GET    /api/v1/posts                   # Listar publicaciones (con filtros)
GET    /api/v1/posts/:id               # Obtener detalle de publicación
PUT    /api/v1/posts/:id               # Actualizar publicación
DELETE /api/v1/posts/:id               # Eliminar publicación
PATCH  /api/v1/posts/:id/resolve       # Marcar como resuelta
```

#### Filtros disponibles en GET /api/v1/posts:
- `?type=LOST` o `?type=FOUND` - Filtrar por tipo
- `?status=ACTIVE` - Filtrar por estado
- Soporta combinaciones de filtros

### 🔒 Autenticación Requerida
Los endpoints protegidos requieren un token JWT en el header:
```http
Authorization: Bearer <tu_token_jwt>
```

### Ejemplo de Request/Response

#### POST /api/v1/auth/register
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Password123!",
  "name": "Juan Pérez",
  "phone": "+57 300 123 4567"
}
```

#### POST /api/v1/posts
```json
{
  "type": "LOST",
  "petType": "DOG",
  "petSize": "MEDIUM",
  "petName": "Max",
  "description": "Perro mestizo de color café",
  "lastSeenLocation": {
    "address": "Carrera 7 #15-30, Tunja",
    "latitude": 5.5353,
    "longitude": -73.3678
  },
  "contactInfo": {
    "name": "Juan Pérez",
    "phone": "+57 300 123 4567"
  },
  "imageUrls": ["https://example.com/image1.jpg"]
}
```

## 🔮 Roadmap de Funcionalidades

### ✅ Fase 1 - Arquitectura Base (Completado)
- ✅ Clean Architecture con 4 capas
- ✅ Domain-Driven Design (DDD)
- ✅ Entidades de dominio: User, Post
- ✅ Value Objects: Location
- ✅ Repository Pattern con interfaces
- ✅ Dependency Injection completa
- ✅ Autenticación JWT funcional
- ✅ Guards y decoradores personalizados
- ✅ DTOs con validaciones
- ✅ Interceptores (Logging, Transform)
- ✅ Exception filters
- ✅ Repositorios en memoria (para desarrollo)
- ✅ Pre-commit hooks (ESLint + Prettier)
- ✅ Documentación completa de arquitectura

### 🚧 Fase 2 - Integración con Azure (En Desarrollo)
- ⏳ Migración a Azure Cosmos DB
  - Implementar `CosmosDbUserRepository`
  - Implementar `CosmosDbPostRepository`
  - Cambiar providers en módulos NestJS
- ⏳ Azure Blob Storage para imágenes
  - Servicio de upload de imágenes
  - Generación de URLs SAS
  - Manejo de thumbnails
- ⏳ Azure Application Insights
  - Logging centralizado
  - Monitoreo de rendimiento
  - Alertas automáticas

### 📅 Fase 3 - Funcionalidades Avanzadas
- 🔜 Matching automático de mascotas
  - Algoritmo de similitud
  - Notificaciones de matches
- 🔜 Sistema de mensajería
  - Chat en tiempo real
  - Notificaciones push
- 🔜 Geolocalización avanzada
  - Búsqueda por radio
  - Mapas interactivos
  - Heatmap de avistamientos
- 🔜 Estadísticas y analytics
  - Dashboard de administración
  - Reportes de reencuentros
  - Métricas de uso

### 🎯 Fase 4 - Optimización y Escalado
- 🔮 Event Sourcing
- 🔮 CQRS completo
- 🔮 Caché distribuido (Redis)
- 🔮 Rate limiting
- 🔮 API Gateway
- 🔮 Microservicios (si es necesario)

## 👨‍💻 Guía de Desarrollo

### Agregar una Nueva Entidad

#### 1. Domain Layer - Crear Entidad
```typescript
// src/domain/entities/nueva-entidad.entity.ts
export class NuevaEntidad {
  constructor(
    public readonly id: string,
    public nombre: string,
    // ... propiedades
  ) {}

  // Métodos de negocio
  public metodoDeNegocio(): void {
    // Lógica de negocio pura
  }
}
```

#### 2. Domain Layer - Crear Interface de Repositorio
```typescript
// src/domain/repositories/nueva-entidad.repository.interface.ts
export interface INuevaEntidadRepository {
  create(entidad: NuevaEntidad): Promise<NuevaEntidad>;
  findById(id: string): Promise<NuevaEntidad | null>;
  // ... métodos CRUD
}
```

#### 3. Infrastructure Layer - Implementar Repositorio
```typescript
// src/infrastructure/database/in-memory/in-memory-nueva-entidad.repository.ts
@Injectable()
export class InMemoryNuevaEntidadRepository implements INuevaEntidadRepository {
  private entidades: NuevaEntidad[] = [];

  async create(entidad: NuevaEntidad): Promise<NuevaEntidad> {
    this.entidades.push(entidad);
    return entidad;
  }
  // ... implementar métodos
}
```

#### 4. Application Layer - Crear DTOs
```typescript
// src/application/dtos/nueva-entidad/create-nueva-entidad.dto.ts
export class CreateNuevaEntidadDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
  // ... validaciones
}
```

#### 5. Application Layer - Crear Service
```typescript
// src/application/services/nueva-entidad.service.ts
@Injectable()
export class NuevaEntidadService {
  constructor(
    @Inject('INuevaEntidadRepository')
    private readonly repository: INuevaEntidadRepository,
  ) {}

  async create(dto: CreateNuevaEntidadDto): Promise<NuevaEntidad> {
    const entidad = new NuevaEntidad(/* ... */);
    return this.repository.create(entidad);
  }
}
```

#### 6. Presentation Layer - Crear Controller
```typescript
// src/presentation/controllers/nueva-entidad.controller.ts
@Controller('api/v1/nueva-entidad')
export class NuevaEntidadController {
  constructor(private readonly service: NuevaEntidadService) {}

  @Post()
  async create(@Body() dto: CreateNuevaEntidadDto) {
    return this.service.create(dto);
  }
}
```

#### 7. Module - Configurar Dependency Injection
```typescript
// src/modules/nueva-entidad/nueva-entidad.module.ts
@Module({
  controllers: [NuevaEntidadController],
  providers: [
    NuevaEntidadService,
    {
      provide: 'INuevaEntidadRepository',
      useClass: InMemoryNuevaEntidadRepository,
    },
  ],
  exports: [NuevaEntidadService],
})
export class NuevaEntidadModule {}
```

### Migrar de In-Memory a Cosmos DB

Cuando estés listo para usar Azure Cosmos DB, solo necesitas:

1. Crear `CosmosDbNuevaEntidadRepository` que implemente `INuevaEntidadRepository`
2. Cambiar el provider en el módulo:
```typescript
{
  provide: 'INuevaEntidadRepository',
  useClass: CosmosDbNuevaEntidadRepository, // ← Cambiar aquí
}
```

**¡Sin tocar ninguna otra capa!** Esto es el poder de Dependency Inversion.

### Mejores Prácticas

✅ **DO's (Hacer)**
- Mantén la lógica de negocio en las entidades del Domain
- Usa DTOs para validación de entrada en Application
- Implementa interfaces del Domain en Infrastructure
- Mantén los controllers delgados (solo validación y llamadas a services)
- Usa decoradores personalizados (@CurrentUser, @Roles)
- Valida con class-validator en DTOs
- Documenta métodos complejos

❌ **DON'Ts (No hacer)**
- NO pongas lógica de negocio en controllers
- NO accedas directamente a repositorios desde controllers
- NO importes Infrastructure en Domain
- NO uses `any` en TypeScript
- NO olvides manejar errores adecuadamente
- NO expongas entidades de dominio directamente en la API

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:cov
```

### Estrategia de Testing por Capa

#### Domain Layer
```typescript
// Testear entidades y lógica de negocio pura
describe('User Entity', () => {
  it('should check if user is admin', () => {
    const user = new User('1', 'test@test.com', 'hash', UserRole.ADMIN);
    expect(user.isAdmin()).toBe(true);
  });
});
```

#### Application Layer
```typescript
// Testear services con repositorios mockeados
describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    } as any;
    
    service = new UsersService(mockRepository);
  });

  it('should create user', async () => {
    mockRepository.create.mockResolvedValue(mockUser);
    const result = await service.create(createDto);
    expect(result).toBe(mockUser);
  });
});
```

#### Presentation Layer
```typescript
// Testear controllers con services mockeados
describe('UsersController', () => {
  let controller: UsersController;
  let mockService: jest.Mocked<UsersService>;

  beforeEach(() => {
    mockService = {
      create: jest.fn(),
    } as any;
    
    controller = new UsersController(mockService);
  });

  it('should call service.create', async () => {
    await controller.create(createDto);
    expect(mockService.create).toHaveBeenCalledWith(createDto);
  });
});
```

## 📦 Deployment

### Preparación para Azure

El proyecto está diseñado para despliegue en **Azure** con:
- **Azure App Service**: Para el backend NestJS
- **Azure Cosmos DB**: Base de datos NoSQL
- **Azure Blob Storage**: Almacenamiento de imágenes
- **Azure Application Insights**: Monitoreo y logging
- **Azure DevOps**: CI/CD pipeline

### Variables de Entorno

Asegúrate de configurar estas variables en Azure App Service:

```bash
# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1

# JWT
JWT_SECRET=tu_secret_super_seguro_en_produccion
JWT_EXPIRES_IN=1d

# Azure Cosmos DB (cuando se integre)
COSMOS_DB_ENDPOINT=https://tu-cosmosdb.documents.azure.com:443/
COSMOS_DB_KEY=tu_key_de_cosmos_db
COSMOS_DB_DATABASE=petfinder

# Azure Blob Storage (cuando se integre)
AZURE_STORAGE_CONNECTION_STRING=tu_connection_string
AZURE_STORAGE_CONTAINER=pet-images
```

### Pipeline CI/CD (Azure DevOps)

El proyecto incluye un pipeline completo de CI/CD automatizado para Azure DevOps:

#### 📋 Archivos del Pipeline

- **`azure-pipelines.yml`**: Pipeline principal con 4 stages
- **`Dockerfile`**: Containerización para Azure App Service
- **`.dockerignore`**: Optimización de builds de Docker
- **`scripts/`**: Scripts de deployment manual

#### 🔄 Flujo del Pipeline

**Stage 1: Build & Test**
- ✅ Instalación de dependencias (npm ci)
- ✅ Lint con ESLint
- ✅ Verificación de formato (Prettier)
- ✅ Build de TypeScript
- ✅ Tests unitarios con coverage
- ✅ Publicación de resultados y artifacts

**Stage 2: Deploy to Staging** (rama `develop`)
- ✅ Deploy automático a Azure App Service (staging slot)
- ✅ Health check post-deployment

**Stage 3: Deploy to Production** (rama `main`)
- ✅ Requiere aprobación manual
- ✅ Deploy a Azure App Service (production)
- ✅ Health check post-deployment

**Stage 4: Post-Deployment Tests**
- ✅ Smoke tests en producción
- ✅ Verificación de endpoints críticos

#### 🚀 Triggers

```yaml
# Push automático
main → Production (con aprobación)
develop → Staging
feature/* → Build & Test only

# Pull Requests
PR a main/develop → Build & Test validation
```

#### 📖 Configuración Completa

Ver guía detallada: [Configuración de Azure DevOps](docs/AZURE-DEVOPS-SETUP.md)

**Pasos principales:**
1. Crear recursos en Azure (App Service, Resource Group)
2. Configurar Service Connection en Azure DevOps
3. Crear Environments (staging, production)
4. Configurar variables y secrets
5. Conectar repositorio y ejecutar pipeline

#### 🛠️ Deployment Manual

Para deployments de emergencia, usar scripts incluidos:

```bash
# Windows (PowerShell)
.\scripts\deploy-azure.ps1 -Environment staging
.\scripts\deploy-azure.ps1 -Environment production

# Linux/Mac (Bash)
./scripts/deploy-azure.sh staging
./scripts/deploy-azure.sh production
```

## 🎓 Beneficios de esta Arquitectura

### 🔄 Mantenibilidad
- Código organizado y fácil de encontrar
- Cambios localizados en una sola capa
- Fácil onboarding de nuevos desarrolladores

### 🧪 Testabilidad
- Cada capa se puede testear independientemente
- Mocks sencillos con interfaces
- Tests unitarios rápidos sin DB

### 🔌 Flexibilidad
- Cambiar de in-memory a Cosmos DB sin tocar lógica de negocio
- Agregar GraphQL sin cambiar Application/Domain
- Migrar a microservicios fácilmente

### 📈 Escalabilidad
- Preparado para Event Sourcing
- Listo para CQRS
- Fácil agregar caché distribuido
- Soporta crecimiento del equipo

### 🛡️ Independencia del Framework
- Lógica de negocio no depende de NestJS
- Puedes cambiar de framework sin reescribir todo
- Domain es TypeScript puro

## 📚 Documentación Adicional

- 📖 [Guía Completa de Arquitectura en Capas](docs/ARQUITECTURA-CAPAS.md)
- 🔧 [Guía de Pre-commit Hooks](docs/PRE-COMMIT-HOOKS.md)
- ☁️ [Configuración de Azure DevOps CI/CD](docs/AZURE-DEVOPS-SETUP.md)

## 🤝 Contribuir

Este es un proyecto académico. Si deseas contribuir:

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit con mensajes descriptivos
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

**Nota**: Los pre-commit hooks ejecutarán automáticamente ESLint y Prettier.

## 👥 Equipo

Desarrollado por el equipo de **PetFinder** como proyecto de Seminario de Grado  
**Universidad Pedagógica y Tecnológica de Colombia (UPTC)**  
Décimo Semestre - 2026

## 📄 Licencia

**UNLICENSED** - Proyecto académico

---

<div align="center">
  <p>🐾 Hecho con ❤️ para ayudar a reunir mascotas con sus familias</p>
  <p><strong>PetFinder</strong> - Porque cada mascota merece volver a casa</p>
</div>
