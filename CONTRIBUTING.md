# 🎯 Guía de Desarrollo - Backend PetFinder

## 📚 Tabla de Contenidos
1. [Instalación](#instalación)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Convenciones de Código](#convenciones-de-código)
4. [Crear un Nuevo Módulo](#crear-un-nuevo-módulo)
5. [Buenas Prácticas](#buenas-prácticas)
6. [Testing](#testing)
7. [Deployment](#deployment)

---

## 🚀 Instalación

### Requisitos previos
- Node.js >= 18
- npm >= 9

### Pasos

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd backend-petfinder

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Ejecutar en modo desarrollo
npm run start:dev

# La API estará en http://localhost:3000/api/v1
```

---

## 📂 Estructura del Proyecto

Ver [ESTRUCTURA.md](./ESTRUCTURA.md) para detalles completos.

**Resumen rápido:**
```
src/
├── modules/          # Módulos de negocio (auth, users, posts)
├── common/           # Código compartido (guards, decorators, etc)
├── config/           # Configuración centralizada
├── app.module.ts     # Módulo raíz
└── main.ts           # Punto de entrada
```

---

## 📝 Convenciones de Código

### Naming Conventions

#### Archivos
- **Controllers**: `nombre.controller.ts` (ej: `users.controller.ts`)
- **Services**: `nombre.service.ts` (ej: `users.service.ts`)
- **Modules**: `nombre.module.ts` (ej: `users.module.ts`)
- **DTOs**: `nombre.dto.ts` (ej: `user.dto.ts`)
- **Interfaces**: `nombre.interface.ts` (ej: `user.interface.ts`)

#### Clases y tipos
- **Clases**: PascalCase (ej: `UsersService`, `CreateUserDto`)
- **Interfaces**: PascalCase con prefijo `I` (ej: `IUser`, `IPost`)
- **Enums**: PascalCase (ej: `UserRole`, `PostType`)
- **Variables**: camelCase (ej: `userId`, `isActive`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `JWT_SECRET`, `API_PREFIX`)

### Calidad de Código Automática

Este proyecto utiliza **pre-commit hooks** para asegurar la calidad del código:

#### 🔍 ESLint
Analiza el código en busca de errores y malas prácticas.

```bash
# Ejecutar manualmente
npm run lint
```

#### ✨ Prettier
Formatea automáticamente el código para mantener consistencia.

```bash
# Ejecutar manualmente
npm run format
```

#### 🎣 Husky + lint-staged
**Cada commit ejecuta automáticamente**:
1. ESLint con auto-fix en archivos .ts
2. Prettier para formateo

**No necesitas preocuparte por el formato** - el sistema lo corrige automáticamente.

```bash
# Flujo normal de trabajo
git add .
git commit -m "feat: nueva funcionalidad"
# ✓ ESLint analiza y corrige
# ✓ Prettier formatea
# ✓ Commit se completa automáticamente
```

📖 **Ver**: [Guía completa de Pre-commit Hooks](docs/PRE-COMMIT-HOOKS.md)

### Estructura de un Módulo

```typescript
// users.module.ts
@Module({
  imports: [],        // Módulos que necesita
  controllers: [],    // Controllers del módulo
  providers: [],      // Services del módulo
  exports: [],        // Qué exportar para otros módulos
})
export class UsersModule {}
```

### Estructura de un Controller

```typescript
// users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }
}
```

### Estructura de un Service

```typescript
// users.service.ts
@Injectable()
export class UsersService {
  async findAll(): Promise<UserResponseDto[]> {
    // Lógica de negocio
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Lógica de negocio
  }
}
```

---

## ➕ Crear un Nuevo Módulo

### Opción 1: CLI de NestJS (Recomendado)

```bash
# Crear un módulo completo (module, controller, service)
nest generate resource nombre-modulo

# Crear solo un módulo
nest generate module nombre-modulo

# Crear solo un controller
nest generate controller nombre-modulo

# Crear solo un service
nest generate service nombre-modulo
```

### Opción 2: Manual

1. Crear carpeta en `src/modules/nombre-modulo/`
2. Crear archivos necesarios:
   - `nombre-modulo.module.ts`
   - `nombre-modulo.controller.ts`
   - `nombre-modulo.service.ts`
   - `dto/nombre-modulo.dto.ts`
   - `interfaces/nombre-modulo.interface.ts`
3. Importar el módulo en `app.module.ts`

---

## ✅ Buenas Prácticas

### 1. DTOs para Validación

**✅ CORRECTO:**
```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

**❌ INCORRECTO:**
```typescript
// No usar tipos genéricos sin validación
async create(data: any) { }
```

### 2. Manejo de Errores

**✅ CORRECTO:**
```typescript
async findOne(id: string): Promise<User> {
  const user = await this.userRepository.findById(id);
  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }
  return user;
}
```

**❌ INCORRECTO:**
```typescript
async findOne(id: string) {
  return this.userRepository.findById(id) || null;
}
```

### 3. Inyección de Dependencias

**✅ CORRECTO:**
```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}
}
```

**❌ INCORRECTO:**
```typescript
export class UsersService {
  private userRepository = new UserRepository();
}
```

### 4. No Exponer Datos Sensibles

**✅ CORRECTO:**
```typescript
async login(loginDto: LoginDto): Promise<AuthResponseDto> {
  const user = await this.validateUser(loginDto);
  const { password, ...userWithoutPassword } = user;
  return {
    accessToken: this.generateToken(user),
    user: userWithoutPassword,
  };
}
```

**❌ INCORRECTO:**
```typescript
async login(loginDto: LoginDto): Promise<User> {
  return this.userRepository.findByEmail(loginDto.email); // Incluye password!
}
```

### 5. Usar Enums para Valores Fijos

**✅ CORRECTO:**
```typescript
export enum PostType {
  LOST = 'lost',
  FOUND = 'found',
}

@IsEnum(PostType)
type: PostType;
```

**❌ INCORRECTO:**
```typescript
@IsString()
type: string; // Puede ser cualquier cosa
```

---

## 🧪 Testing

### Tests Unitarios

```bash
# Ejecutar todos los tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

Ejemplo de test:
```typescript
describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Tests E2E

```bash
npm run test:e2e
```

---

## 🚢 Deployment

### Build para Producción

```bash
# Compilar el proyecto
npm run build

# Ejecutar en producción
npm run start:prod
```

### Variables de Entorno para Producción

Asegúrate de configurar estas variables en tu servidor:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<secret-seguro-y-largo>
COSMOS_ENDPOINT=<tu-cosmos-endpoint>
COSMOS_KEY=<tu-cosmos-key>
AZURE_STORAGE_CONNECTION_STRING=<tu-connection-string>
```

### CI/CD con Azure DevOps

(Configuración pendiente para FASE 2)

---

## 📖 Recursos Adicionales

- [Documentación de NestJS](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Azure Cosmos DB Docs](https://docs.microsoft.com/azure/cosmos-db/)
- [class-validator Docs](https://github.com/typestack/class-validator)

---

## 🤝 Contribución

### Flujo de trabajo con Git

1. **Crear rama desde `develop`**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nombre-funcionalidad
   ```

2. **Hacer commits descriptivos**
   ```bash
   # Los pre-commit hooks se ejecutan automáticamente
   git add .
   git commit -m "feat: agregar nueva funcionalidad"
   ```
   
   ✅ **Pre-commit hooks automáticos**:
   - ESLint corrige problemas de código
   - Prettier formatea el código
   - Si hay errores críticos, el commit se cancela

3. **Ejecutar tests antes de push**
   ```bash
   npm run test
   npm run test:e2e
   ```

4. **Push y crear Pull Request**
   ```bash
   git push origin feature/nombre-funcionalidad
   # Crear PR hacia develop en GitHub/Azure DevOps
   ```

### Convenciones de Commits

Usar formato de [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan lógica)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

**Ejemplos**:
```bash
git commit -m "feat: agregar endpoint de búsqueda de mascotas"
git commit -m "fix: corregir validación de email en registro"
git commit -m "docs: actualizar README con nuevos endpoints"
```

### ⚡ Solución de Problemas

#### Pre-commit hook falla
Si el commit se cancela:

```bash
# Ver los errores
npm run lint

# Corregir manualmente si es necesario
# Volver a intentar commit
git add .
git commit -m "tu mensaje"
```

#### Omitir hooks (NO RECOMENDADO)
Solo en casos excepcionales:

```bash
git commit -m "mensaje" --no-verify
```

⚠️ Esto puede introducir código que no cumple estándares.

---

**Happy Coding! 🚀**
