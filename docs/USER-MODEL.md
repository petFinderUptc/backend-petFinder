# 📋 Estructura del Modelo User - Azure Cosmos DB

## 📊 Resumen de la Implementación

Modelo User para PetFinder implementado con Clean Architecture y optimizado para Azure Cosmos DB.

---

## 🏗️ Estructura Completa del Modelo

### Entidad de Dominio

**Ubicación**: `src/domain/entities/user.entity.ts`

```typescript
export class User {
  constructor(
    public readonly id: string,              // UUID v4
    public email: string,                    // PARTITION KEY + UNIQUE
    public username: string,                 // UNIQUE KEY
    public password: string,                 // Bcrypt hash
    public firstName: string,
    public lastName: string,
    public role: UserRole,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public phoneNumber?: string,             // Formato: +57XXXXXXXXXX
    public profileImage?: string,            // URL (Azure Blob/CDN)
    public city?: string,
    public department?: string,              // Departamento de Colombia
    public bio?: string,                     // Max 500 caracteres
    public emailVerified?: boolean,
    public phoneVerified?: boolean,
    public lastLogin?: Date,
    public failedLoginAttempts?: number,
    public accountLockedUntil?: Date,
  )
}
```

### Tipos de Datos y Restricciones

| Campo | Tipo | Restricción | Requerido | Descripción |
|-------|------|-------------|-----------|-------------|
| **id** | string | UUID v4 | ✅ | Identificador único del usuario |
| **email** | string | Email válido, único | ✅ | PARTITION KEY - Email del usuario |
| **username** | string | 3-20 caracteres, alfanumérico + _ - | ✅ | UNIQUE KEY - Username único |
| **password** | string | Mín. 8 caracteres | ✅ | Hash bcrypt de la contraseña |
| **firstName** | string | Mín. 2 caracteres | ✅ | Nombre(s) del usuario |
| **lastName** | string | Mín. 2 caracteres | ✅ | Apellido(s) del usuario |
| **role** | UserRole | Enum: user, admin, moderator | ✅ | Rol del usuario en el sistema |
| **isActive** | boolean | true / false | ✅ | Estado de la cuenta |
| **createdAt** | Date | ISO 8601 | ✅ | Fecha de creación |
| **updatedAt** | Date | ISO 8601 | ✅ | Fecha de última actualización |
| **phoneNumber** | string | Formato: +57XXXXXXXXXX | ❌ | Teléfono móvil |
| **profileImage** | string | URL válida | ❌ | Imagen de perfil (Azure Blob) |
| **city** | string | - | ❌ | Ciudad de residencia |
| **department** | string | - | ❌ | Departamento de Colombia |
| **bio** | string | Max 500 caracteres | ❌ | Biografía del usuario |
| **emailVerified** | boolean | Default: false | ❌ | Email verificado |
| **phoneVerified** | boolean | Default: false | ❌ | Teléfono verificado |
| **lastLogin** | Date | ISO 8601 | ❌ | Último login exitoso |
| **failedLoginAttempts** | number | Default: 0 | ❌ | Intentos fallidos consecutivos |
| **accountLockedUntil** | Date | ISO 8601 | ❌ | Fecha hasta bloqueo temporal |

---

## 🔑 Configuración de Índices en Cosmos DB

### Partition Key

```json
{
  "paths": ["/email"],
  "kind": "Hash",
  "version": 2
}
```

- **Ventajas**:
  - ✅ Distribución uniforme (email único)
  - ✅ Lecturas por email ultra-rápidas (2-3 RUs)
  - ✅ Evita hot partitions

### Unique Keys

```json
{
  "uniqueKeys": [
    { "paths": ["/username"] },
    { "paths": ["/email"] }
  ]
}
```

- **Garantiza**:
  - ✅ No puede haber emails duplicados
  - ✅ No puede haber usernames duplicados
  - ✅ Intentos duplicados lanzan error 409 (Conflict)

### Índices Compuestos

```json
"compositeIndexes": [
  [
    { "path": "/username", "order": "ascending" },
    { "path": "/createdAt", "order": "descending" }
  ],
  [
    { "path": "/role", "order": "ascending" },
    { "path": "/createdAt", "order": "descending" }
  ],
  [
    { "path": "/isActive", "order": "ascending" },
    { "path": "/updatedAt", "order": "descending" }
  ]
]
```

---

## 📝 Validaciones de Negocio

### En la Entidad (Domain Layer)

```typescript
// Validación de email
private isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validación de username
private isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

// Validación de biografía
if (this.bio && this.bio.length > 500) {
  throw new Error('La biografía no puede exceder 500 caracteres');
}
```

### Reglas de Negocio

1. **Bloqueo de Cuenta**: Después de 5 intentos fallidos, la cuenta se bloquea por 30 minutos
2. **Username**: Solo letras, números, guiones y guiones bajos
3. **Email**: Debe ser un email válido formato RFC 5322
4. **Contraseña**: Mínimo 8 caracteres (validado en DTO)

---

## 🎯 Queries Optimizadas

### 1. Buscar por Email (Single-Partition)

```typescript
// COSTO: 2-3 RUs
const { resources } = await container.items
  .query({
    query: 'SELECT * FROM c WHERE c.email = @email',
    parameters: [{ name: '@email', value: 'user@example.com' }]
  })
  .fetchAll();
```

### 2. Buscar por Username (Índice Compuesto)

```typescript
// COSTO: 3-5 RUs
const { resources } = await container.items
  .query({
    query: `
      SELECT * FROM c 
      WHERE c.username = @username
      ORDER BY c.createdAt DESC
    `,
    parameters: [{ name: '@username', value: 'john_doe' }]
  })
  .fetchAll();
```

### 3. Filtrar por Rol (Índice Compuesto)

```typescript
// COSTO: 3-5 RUs
const { resources } = await container.items
  .query({
    query: `
      SELECT * FROM c 
      WHERE c.role = @role
      ORDER BY c.createdAt DESC
    `,
    parameters: [{ name: '@role', value: 'admin' }]
  })
  .fetchAll();
```

### 4. Usuarios Activos (Índice Compuesto)

```typescript
// COSTO: 3-5 RUs
const { resources } = await container.items
  .query({
    query: `
      SELECT * FROM c 
      WHERE c.isActive = true
      ORDER BY c.updatedAt DESC
    `,
  })
  .fetchAll();
```

### 5. Usuarios con Email No Verificado

```typescript
// COSTO: 5-10 RUs (cross-partition)
const { resources } = await container.items
  .query(`
    SELECT * FROM c 
    WHERE c.emailVerified = false 
      AND c.isActive = true
      AND DateTimeDiff('day', c.createdAt, GetCurrentDateTime()) > 7
  `)
  .fetchAll();
```

---

## 🔐 Seguridad y Autenticación

### Hashing de Contraseñas

```typescript
import * as bcrypt from 'bcrypt';

// Al crear usuario
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// Al verificar login
const isValid = await bcrypt.compare(plainPassword, user.password);
```

### Control de Intentos Fallidos

```typescript
// Registrar intento fallido
user.recordFailedLoginAttempt();
// Si failedLoginAttempts >= 5, accountLockedUntil se establece

// Verificar si está bloqueado
if (user.isAccountLocked()) {
  throw new Error('Cuenta bloqueada temporalmente');
}

// Registrar login exitoso
user.recordSuccessfulLogin();
// Resetea failedLoginAttempts y accountLockedUntil
```

---

## 📦 DTOs (Data Transfer Objects)

### CreateUserDto

```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{3,20}$/)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsOptional()
  @IsPhoneNumber('CO')
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
```

### UpdateUserDto

```typescript
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber('CO')
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  department?: string;
}
```

### UserResponseDto

```typescript
export class UserResponseDto {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  profileImage?: string;
  city?: string;
  department?: string;
  fullLocation?: string;
  bio?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  // NO exponer: password, failedLoginAttempts, accountLockedUntil
}
```

---

## 🧪 Scripts de Prueba

```bash
# Verificar configuración del contenedor
npm run check:users-container

# Probar operaciones CRUD completas
npm run test:users-crud

# Verificar unique keys
node scripts/test-unique-keys.js

# Recrear contenedor con unique keys
node scripts/recreate-users-container-unique-keys.js
```

---

## 📚 Archivos Relacionados

- **Entidad**: [src/domain/entities/user.entity.ts](../src/domain/entities/user.entity.ts)
- **Enum Role**: [src/domain/enums/user-role.enum.ts](../src/domain/enums/user-role.enum.ts)
- **Repository Interface**: [src/domain/repositories/user.repository.interface.ts](../src/domain/repositories/user.repository.interface.ts)
- **Types**: [src/infrastructure/database/types/user-document.type.ts](../src/infrastructure/database/types/user-document.type.ts)
- **DTOs**: [src/application/dtos/users/user.dto.ts](../src/application/dtos/users/user.dto.ts)
- **Service**: [src/infrastructure/database/cosmosdb.service.ts](../src/infrastructure/database/cosmosdb.service.ts)

---

## 🎯 Próximos Pasos

1. ✅ Estructura del modelo definida
2. ✅ Tipos TypeScript creados
3. ✅ Índices únicos configurados
4. ⏳ Implementar CosmosUserRepository
5. ⏳ Actualizar DTOs con campo username
6. ⏳ Implementar autenticación JWT
7. ⏳ Implementar verificación de email
8. ⏳ Agregar tests unitarios e integración

---

**Última actualización**: Marzo 2026  
**Versión del Modelo**: 1.0  
**Autor**: Backend Team - PetFinder UPTC
