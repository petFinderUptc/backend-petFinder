# 🏗️ Arquitectura en Capas - Backend PetFinder

## 📋 Contenido

1. [Introducción](#introducción)
2. [Principios Arquitectónicos](#principios-arquitectónicos)
3. [Estructura de Capas](#estructura-de-capas)
4. [Flujo de Datos](#flujo-de-datos)
5. [Beneficios](#beneficios)
6. [Guía de Desarrollo](#guía-de-desarrollo)

---

## 🎯 Introducción

El backend de PetFinder está organizado siguiendo los principios de **Clean Architecture** y **Domain-Driven Design (DDD)**. La aplicación está dividida en capas claramente definidas, cada una con responsabilidades específicas.

### Arquitectura Implementada

```
📦 src/
├── 🎨 presentation/        # Capa de Presentación (UI/API Layer)
├── 📋 application/         # Capa de Aplicación (Use Cases Layer)
├── 💎 domain/              # Capa de Dominio (Business Logic Layer)
├── 🔧 infrastructure/      # Capa de Infraestructura (Data Layer)
└── 🔌 modules/             # Módulos de NestJS (Dependency Injection)
```

---

## 🧩 Principios Arquitectónicos

### 1. Separation of Concerns (SoC)
Cada capa tiene una responsabilidad única y bien definida:
- **Domain**: Reglas de negocio puras
- **Application**: Casos de uso y orchestración
- **Infrastructure**: Detalles técnicos e implementaciones
- **Presentation**: Interfaz con el exterior (HTTP, WebSockets, etc.)

### 2. Dependency Inversion (SOLID)
Las capas internas no dependen de las externas:

```
Domain (Core) ← Application ← Infrastructure
                      ↑
                 Presentation
```

- **Domain** define interfaces (contratos)
- **Infrastructure** implementa esas interfaces
- **Application** usa las interfaces, no las implementaciones

### 3. Testabilidad
Cada capa puede ser testeada de forma independiente:
- **Domain**: Tests unitarios puros (sin dependencias)
- **Application**: Tests de casos de uso (con mocks de repositorios)
- **Infrastructure**: Tests de integración
- **Presentation**: Tests E2E

---

## 📂 Estructura de Capas

### 🎨 1. Capa de Presentación (`presentation/`)

**Responsabilidad**: Interfaz con el mundo exterior (HTTP, WebSockets, GraphQL)

```
presentation/
├── controllers/          # Controllers HTTP de NestJS
│   ├── auth.controller.ts
│   ├── users.controller.ts
│   └── posts.controller.ts
├── guards/               # Guards de autenticación/autorización
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── decorators/           # Decorators personalizados
│   ├── current-user.decorator.ts
│   └── roles.decorator.ts
├── filters/              # Exception filters
│   └── http-exception.filter.ts
├── interceptors/         # Interceptors HTTP
│   ├── logging.interceptor.ts
│   └── transform.interceptor.ts
├── pipes/                # Pipes de validación
│   └── parse-objectid.pipe.ts
└── strategies/           # Passport strategies
    └── jwt.strategy.ts
```

**Responsabilidades**:
- Recibir peticiones HTTP
- Validar entrada (via DTOs)
- Delegar a servicios de aplicación
- Retornar respuestas HTTP
- Manejo de autenticación/autorización

**Ejemplo**:
```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }
}
```

---

### 📋 2. Capa de Aplicación (`application/`)

**Responsabilidad**: Casos de uso y orchestración de lógica de negocio

```
application/
├── dtos/                 # Data Transfer Objects
│   ├── auth/
│   │   └── auth.dto.ts
│   ├── users/
│   │   └── user.dto.ts
│   └── posts/
│       └── post.dto.ts
├── services/             # Servicios de aplicación (Casos de uso)
│   ├── auth.service.ts
│   ├── users.service.ts
│   └── posts.service.ts
└── interfaces/           # Interfaces de aplicación
    └── api-response.interface.ts
```

**Responsabilidades**:
- Implementar casos de uso del sistema
- Orquestar entidades del dominio
- Usar repositorios (vía interfaces)
- Transformar entidades a DTOs
- Validar reglas de negocio de aplicación
- Transacciones y coordinación

**Ejemplo**:
```typescript
@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    // 1. Verificar reglas de negocio
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) throw new ConflictException();

    // 2. Crear entidad de dominio
    const user = new User(...);

    // 3. Persistir usando repositorio
    const saved = await this.userRepository.create(user);

    // 4. Retornar DTO
    return this.toResponseDto(saved);
  }
}
```

---

### 💎 3. Capa de Dominio (`domain/`)

**Responsabilidad**: Lógica de negocio pura (Core de la aplicación)

```
domain/
├── entities/             # Entidades de dominio
│   ├── user.entity.ts
│   └── post.entity.ts
├── value-objects/        # Value Objects inmutables
│   └── location.vo.ts
├── enums/                # Enumeraciones del dominio
│   ├── user-role.enum.ts
│   ├── post-type.enum.ts
│   ├── post-status.enum.ts
│   ├── pet-type.enum.ts
│   └── pet-size.enum.ts
└── repositories/         # Interfaces de repositorios (contratos)
    ├── user.repository.interface.ts
    └── post.repository.interface.ts
```

**Responsabilidades**:
- Definir entidades con reglas de negocio
- Encapsular lógica de dominio
- Definir Value Objects
- Definir contratos de repositorios
- **Sin dependencias externas** (frameworks, bases de datos, etc.)

**Ejemplo de Entidad**:
```typescript
export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public password: string,
    // ... más propiedades
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.isValidEmail(this.email)) {
      throw new Error('Email inválido');
    }
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }
}
```

**Ejemplo de Interfaz de Repositorio**:
```typescript
export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
```

---

### 🔧 4. Capa de Infraestructura (`infrastructure/`)

**Responsabilidad**: Implementaciones técnicas y servicios externos

```
infrastructure/
├── database/             # Persistencia de datos
│   ├── repositories/     # Implementaciones de repositorios
│   │   ├── user.repository.ts      # TODO: Cosmos DB
│   │   └── post.repository.ts      # TODO: Cosmos DB
│   └── in-memory/        # Implementación temporal en memoria
│       ├── in-memory-user.repository.ts
│       └── in-memory-post.repository.ts
├── config/               # Configuración
│   └── configuration.ts
└── external-services/    # Servicios externos
    └── azure/            # Azure Blob Storage, etc.
```

**Responsabilidades**:
- Implementar interfaces de repositorios del dominio
- Acceso a bases de datos
- Integraciones con servicios externos
- Configuración de infraestructura
- Manejo de conexiones y recursos

**Ejemplo de Repositorio**:
```typescript
@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async create(user: User): Promise<User> {
    const newUser = new User(
      this.generateId(),
      user.email,
      // ...
    );
    this.users.push(newUser);
    return newUser;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  // ... más implementaciones
}
```

---

### 🔌 5. Módulos de NestJS (`modules/`)

**Responsabilidad**: Orquestación de dependencias (Dependency Injection)

```
modules/
├── auth/
│   └── auth.module.ts
├── users/
│   └── users.module.ts
└── posts/
    └── posts.module.ts
```

**Responsabilidades**:
- Configurar inyección de dependencias
- Conectar capas (Controller → Service → Repository)
- Configurar módulos de NestJS
- Exportar servicios para otros módulos

**Ejemplo**:
```typescript
@Module({
  controllers: [UsersController],  // Capa de Presentación
  providers: [
    UsersService,                  // Capa de Aplicación
    {
      provide: 'IUserRepository',  // Interfaz del Dominio
      useClass: InMemoryUserRepository, // Implementación de Infraestructura
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
```

**Ventaja**: Para cambiar a Cosmos DB, solo se modifica el `useClass`:

```typescript
{
  provide: 'IUserRepository',
  useClass: CosmosDbUserRepository, // Nueva implementación
}
```

---

## 🔄 Flujo de Datos

### Petición HTTP → Respuesta

```
1. HTTP Request
   ↓
2. Controller (Presentation)
   - Recibe petición
   - Valida DTO
   ↓
3. Service (Application)
   - Ejecuta caso de uso
   - Usa repositorios
   ↓
4. Repository Interface (Domain)
   - Contrato definido
   ↓
5. Repository Implementation (Infrastructure)
   - Acceso a base de datos
   - Retorna entidad de dominio
   ↓
6. Entity (Domain)
   - Aplica reglas de negocio
   ↓
7. Service (Application)
   - Convierte a DTO
   ↓
8. Controller (Presentation)
   - Retorna respuesta HTTP
   ↓
9. HTTP Response
```

### Ejemplo Concreto: Crear Usuario

```typescript
// 1. HTTP POST /api/v1/users
{
  "email": "juan@example.com",
  "password": "secret123",
  "firstName": "Juan",
  "lastName": "Pérez"
}

// 2. UsersController recibe CreateUserDto
@Post()
async create(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}

// 3. UsersService ejecuta caso de uso
async create(dto: CreateUserDto) {
  // Verificar con repositorio
  const exists = await this.userRepository.existsByEmail(dto.email);
  if (exists) throw new ConflictException();

  // Crear entidad de dominio
  const user = new User(
    '',
    dto.email,
    await bcrypt.hash(dto.password, 10),
    dto.firstName,
    dto.lastName,
    UserRole.USER,
    true,
    new Date(),
    new Date()
  );

  // Persistir con repositorio
  const saved = await this.userRepository.create(user);

  // Retornar DTO
  return this.toResponseDto(saved);
}

// 4. InMemoryUserRepository persiste
async create(user: User): Promise<User> {
  const newUser = new User(...user.toPlainObject(), id: this.generateId());
  this.users.push(newUser);
  return newUser;
}

// 5. Respuesta HTTP
{
  "id": "user_123",
  "email": "juan@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "user",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## ✅ Beneficios

### 1. **Independencia de Frameworks**
El dominio no depende de NestJS, Express, etc. Puedes cambiar el framework sin afectar la lógica de negocio.

### 2. **Independencia de Base de Datos**
Actualmente usamos repositorios en memoria. Cambiar a Cosmos DB solo requiere crear nuevas implementaciones de repositorios.

### 3. **Testabilidad**
```typescript
// Test de dominio (sin dependencias)
describe('User Entity', () => {
  it('should validate email', () => {
    expect(() => new User('', 'invalid', ...)).toThrow();
  });
});

// Test de aplicación (con mocks)
describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    repository = createMock<IUserRepository>();
    service = new UsersService(repository);
  });

  it('should create user', async () => {
    repository.existsByEmail.mockResolvedValue(false);
    // ... test
  });
});
```

### 4. **Mantenibilidad**
Cada capa es independiente. Cambios en UI no afectan dominio. Cambios en base de datos no afectan casos de uso.

### 5. **Escalabilidad**
Fácil agregar nuevas funcionalidades siguiendo el mismo patrón:
1. Crear entidades en `domain/`
2. Crear DTOs y servicios en `application/`
3. Crear controllers en `presentation/`
4. Crear repositorios en `infrastructure/`
5. Configurar en `modules/`

---

## 🛠️ Guía de Desarrollo

### Agregar Nueva Funcionalidad

#### Ejemplo: Módulo de Comentarios

**1. Capa de Dominio**

```typescript
// domain/entities/comment.entity.ts
export class Comment {
  constructor(
    public readonly id: string,
    public readonly postId: string,
    public readonly userId: string,
    public content: string,
    public createdAt: Date
  ) {
    this.validate();
  }

  private validate() {
    if (this.content.length < 10) {
      throw new Error('Comentario muy corto');
    }
  }
}

// domain/repositories/comment.repository.interface.ts
export interface ICommentRepository {
  create(comment: Comment): Promise<Comment>;
  findByPostId(postId: string): Promise<Comment[]>;
}
```

**2. Capa de Aplicación**

```typescript
// application/dtos/comments/comment.dto.ts
export class CreateCommentDto {
  @IsString()
  @MinLength(10)
  content: string;

  @IsString()
  postId: string;
}

// application/services/comments.service.ts
@Injectable()
export class CommentsService {
  constructor(
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
  ) {}

  async create(userId: string, dto: CreateCommentDto): Promise<Comment> {
    const comment = new Comment('', dto.postId, userId, dto.content, new Date());
    return await this.commentRepository.create(comment);
  }
}
```

**3. Capa de Infraestructura**

```typescript
// infrastructure/database/in-memory/in-memory-comment.repository.ts
@Injectable()
export class InMemoryCommentRepository implements ICommentRepository {
  private comments: Comment[] = [];

  async create(comment: Comment): Promise<Comment> {
    const newComment = new Comment(
      this.generateId(),
      comment.postId,
      comment.userId,
      comment.content,
      new Date()
    );
    this.comments.push(newComment);
    return newComment;
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    return this.comments.filter(c => c.postId === postId);
  }
}
```

**4. Capa de Presentación**

```typescript
// presentation/controllers/comments.controller.ts
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(@Body() dto: CreateCommentDto): Promise<Comment> {
    const mockUserId = 'current-user-id'; // TODO: Get from JWT
    return this.commentsService.create(mockUserId, dto);
  }

  @Get('post/:postId')
  async getByPost(@Param('postId') postId: string): Promise<Comment[]> {
    return this.commentsService.findByPostId(postId);
  }
}
```

**5. Módulo de NestJS**

```typescript
// modules/comments/comments.module.ts
@Module({
  controllers: [CommentsController],
  providers: [
    CommentsService,
    {
      provide: 'ICommentRepository',
      useClass: InMemoryCommentRepository,
    },
  ],
  exports: [CommentsService],
})
export class CommentsModule {}
```

---

## 📊 Diagrama de Dependencias

```
┌─────────────────────────────────────────┐
│          Presentation Layer             │
│  (Controllers, Guards, Decorators)      │
└──────────────┬──────────────────────────┘
               │ depends on
               ↓
┌─────────────────────────────────────────┐
│          Application Layer              │
│    (Services, DTOs, Use Cases)          │
└──────────────┬──────────────────────────┘
               │ depends on
               ↓
┌─────────────────────────────────────────┐
│            Domain Layer                 │
│  (Entities, Value Objects, Interfaces)  │  ← Core (Independent)
└─────────────────────────────────────────┘
               ↑ implements
               │
┌─────────────────────────────────────────┐
│        Infrastructure Layer             │
│  (Repositories, Database, External)     │
└─────────────────────────────────────────┘
```

---

## 🎓 Mejores Prácticas

### 1. **Dominio Puro**
- ❌ NO usar decorators de NestJS en entidades
- ❌ NO importar librerías de frameworks en dominio
- ✅ SÍ usar TypeScript puro
- ✅ SÍ encapsular lógica de negocio en entidades

### 2. **Inyección de Dependencias**
- ✅ Usar interfaces en constructores
- ✅ Inyectar repositorios por interfaz
- ✅ Configurar providers en módulos

### 3. **DTOs vs Entidades**
- **DTOs**: Para transferencia HTTP (entrada/salida)
- **Entidades**: Para lógica de negocio interna
- Siempre convertir entre ambos

### 4. **Repositorios**
- Definir interfaces en `domain/`
- Implementar en `infrastructure/`
- Inyectar por interfaz

### 5. **Testabilidad**
- Mockear repositorios en tests de servicios
- Tests unitarios para entidades
- Tests E2E para controllers

---

## 🚀 Roadmap de Migración

### Fase Actual: In-Memory Repositories
✅ Arquitectura en capas implementada
✅ Repositorios en memoria funcionando
✅ Separación de responsabilidades

### Fase 2: Azure Cosmos DB
🔄 Crear implementaciones de repositorios con Cosmos DB
🔄 Actualizar módulos para usar nuevas implementaciones
🔄 Mantener la misma interfaz (sin cambios en servicios)

### Fase 3: Features Avanzadas
📅 Matching automático de mascotas
📅 Geolocalización con Azure Maps
📅 Notificaciones en tiempo real
📅 Sistema de mensajería

---

## 📚 Referencias

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

**Última actualización**: 2024
**Autor**: PetFinder Team - UPTC
