# Guards de Autenticación y Autorización

## 📋 Descripción General

Sistema completo de guards para proteger endpoints privados del backend utilizando JWT (JSON Web Tokens) y roles de usuario.

## 🏗️ Arquitectura de Seguridad

```
Cliente
  │
  ├─> Headers: Authorization: Bearer <JWT>
  │
  ▼
┌─────────────────────────────────────┐
│       Controller (Endpoint)         │
│  @UseGuards(JwtAuthGuard, RolesGuard)│
│  @Roles(UserRole.ADMIN)             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│        1. JwtAuthGuard              │
│  - Extrae token del header          │
│  - Valida firma y expiración        │
│  - Llama a JwtStrategy              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│        2. JwtStrategy               │
│  - Decodifica payload (sub, email)  │
│  - Busca usuario en BD              │
│  - Verifica que esté activo         │
│  - Inyecta user en request.user     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│        3. RolesGuard (opcional)     │
│  - Lee roles requeridos del metadata│
│  - Extrae user.role de request.user │
│  - Verifica permisos                │
└──────────────┬──────────────────────┘
               │
               ▼ Si todo OK
┌─────────────────────────────────────┐
│      Handler del Controller         │
│  - Puede usar @CurrentUser()        │
│  - Acceso garantizado               │
└─────────────────────────────────────┘
```

## 🔐 Componentes Implementados

### 1. JwtStrategy ([src/presentation/strategies/jwt.strategy.ts](src/presentation/strategies/jwt.strategy.ts))

Estrategia de Passport que valida tokens JWT automáticamente.

**Responsabilidades:**
- Extraer JWT del header `Authorization: Bearer <token>`
- Verificar firma con el secret configurado
- Validar que no esté expirado
- Decodificar payload (sub, email)
- Buscar usuario en la base de datos
- Inyectar usuario en `request.user`

**Configuración:**
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }
    return { id, email, username, firstName, lastName, role, isActive };
  }
}
```

### 2. JwtAuthGuard ([src/presentation/guards/jwt-auth.guard.ts](src/presentation/guards/jwt-auth.guard.ts))

Guard que protege endpoints requiriendo autenticación válida.

**Uso:**
```typescript
@Get('profile/me')
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user: UserFromJwt) {
  return this.usersService.findOne(user.id);
}
```

**Respuestas:**
- ✅ Token válido → Continúa al handler (200)
- ❌ Sin token → 401 Unauthorized
- ❌ Token inválido/expirado → 401 Unauthorized
- ❌ Usuario no existe → 401 Unauthorized

### 3. RolesGuard ([src/presentation/guards/roles.guard.ts](src/presentation/guards/roles.guard.ts))

Guard que verifica que el usuario tenga uno de los roles requeridos.

**IMPORTANTE:** Debe usarse DESPUÉS de JwtAuthGuard.

**Uso:**
```typescript
@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard)  // JwtAuthGuard PRIMERO
@Roles(UserRole.ADMIN)
async deleteUser(@Param('id') id: string) {
  return this.usersService.remove(id);
}
```

**Respuestas:**
- ✅ Usuario tiene rol requerido → Continúa al handler
- ❌ Sin rol requerido → 403 Forbidden
- ❌ Sin usuario (JwtAuthGuard no ejecutado) → 403 Forbidden

### 4. Decorators Personalizados

#### @CurrentUser() ([src/presentation/decorators/current-user.decorator.ts](src/presentation/decorators/current-user.decorator.ts))

Extrae el usuario inyectado por JwtAuthGuard desde `request.user`.

**Uso básico:**
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: UserFromJwt) {
  // user = { id, email, username, firstName, lastName, role, isActive }
  return user;
}
```

**Extraer propiedad específica:**
```typescript
@Get('email')
@UseGuards(JwtAuthGuard)
getEmail(@CurrentUser('email') email: string) {
  return { email };
}
```

#### @Roles() ([src/presentation/decorators/roles.decorator.ts](src/presentation/decorators/roles.decorator.ts))

Define qué roles tienen permiso para acceder al endpoint.

**Un rol:**
```typescript
@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
deleteUser(@Param('id') id: string) { }
```

**Múltiples roles (OR - con que tenga uno es suficiente):**
```typescript
@Get('admin-or-moderator')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
getData() { }
```

## 🎯 Ejemplos de Uso

### Endpoint Público (sin protección)

```typescript
@Post('register')
@HttpCode(HttpStatus.CREATED)
async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
  return this.authService.register(registerDto);
}
```

### Endpoint Protegido (requiere autenticación)

```typescript
@Get('profile/me')
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user: UserFromJwt): Promise<UserResponseDto> {
  return this.usersService.findOne(user.id);
}
```

### Endpoint Solo para ADMIN

```typescript
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async findAll(): Promise<UserResponseDto[]> {
  return this.usersService.findAll();
}
```

### Endpoint con Roles Múltiples

```typescript
@Post(':id/approve')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
async approve(@Param('id') id: string, @CurrentUser() user: UserFromJwt) {
  // Solo ADMIN o MODERATOR pueden aprobar
  return this.postsService.approve(id, user.id);
}
```

## 📍 Endpoints Protegidos Actuales

### UsersController

| Endpoint | Método | Protección | Descripción |
|----------|--------|------------|-------------|
| `/users` | GET | 🔐 ADMIN | Listar todos los usuarios |
| `/users/:id` | GET | 🌍 Público | Ver perfil de un usuario |
| `/users/profile/me` | GET | 🔒 Autenticado | Ver perfil propio |
| `/users/profile/me` | PUT | 🔒 Autenticado | Actualizar perfil propio |
| `/users/:id` | PUT | 🔐 ADMIN | Actualizar cualquier usuario |
| `/users/:id` | DELETE | 🔐 ADMIN | Eliminar usuario |

### AuthController

| Endpoint | Método | Protección | Descripción |
|----------|--------|------------|-------------|
| `/auth/register` | POST | 🌍 Público | Registrar nuevo usuario |
| `/auth/login` | POST | 🌍 Público | Iniciar sesión |

## 🔑 Formato del Token JWT

### Request Header
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNjE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Token Decodificado

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-id-here",
    "email": "user@example.com",
    "iat": 1709654400,
    "exp": 1710259200
  }
}
```

### Usuario Inyectado (request.user)

Después de pasar por JwtAuthGuard, el objeto `request.user` contiene:

```typescript
{
  id: "uuid",
  email: "user@example.com",
  username: "username",
  firstName: "John",
  lastName: "Doe",
  role: "USER",
  isActive: true
}
```

## 🚨 Códigos de Error

| Código | Mensaje | Causa |
|--------|---------|-------|
| 401 | Unauthorized | Token ausente, inválido o expirado |
| 401 | "Usuario no encontrado" | Usuario fue eliminado después de emitir el token |
| 401 | "Usuario inactivo" | Usuario fue desactivado |
| 403 | Forbidden | Usuario autenticado pero sin permisos (rol incorrecto) |

## 🧪 Pruebas

### Prueba Manual con cURL

```bash
# 1. Registrar usuario
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User"
  }'
# Guardar el accessToken de la respuesta

# 2. Acceder a endpoint protegido
TOKEN="tu-token-aqui"
curl -X GET http://localhost:3000/api/v1/users/profile/me \
  -H "Authorization: Bearer $TOKEN"

# 3. Intentar sin token (debería fallar con 401)
curl -X GET http://localhost:3000/api/v1/users/profile/me

# 4. Intentar endpoint de admin sin rol (debería fallar con 403)
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

### Script Automatizado

```bash
# Ejecutar script de prueba completo
node scripts/test-protected-endpoints.js
```

El script prueba:
- ✅ Registro y obtención de token
- ✅ Acceso a endpoint protegido con token válido
- ❌ Acceso sin token (401)
- ❌ Acceso con token inválido (401)
- ✅ Actualización de perfil propio
- ❌ Acceso a endpoint de admin sin rol (403)
- ✅ Acceso a endpoint público sin token

## ⚙️ Configuración en Módulos

### AuthModule

```typescript
@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({ ... }),
  ],
  providers: [
    AuthService,
    JwtStrategy,  // ✅ Registrada
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
```

## 📝 Mejores Prácticas

### ✅ DO (Hacer)

- ✅ Usar `JwtAuthGuard` para proteger endpoints privados
- ✅ Usar `RolesGuard` **después** de `JwtAuthGuard` para verificar roles
- ✅ Usar `@CurrentUser()` para extraer usuario en handlers
- ✅ Validar que el usuario esté activo en JwtStrategy
- ✅ Incluir token en header `Authorization: Bearer <token>`
- ✅ Manejar tokens expirados apropiadamente
- ✅ Usar roles específicos para operaciones sensibles

### ❌ DON'T (No hacer)

- ❌ No usar `RolesGuard` sin `JwtAuthGuard`
- ❌ No confiar solo en datos del cliente sin validar token
- ❌ No exponer tokens en logs o URLs
- ❌ No usar tokens en query params (usar headers)
- ❌ No ignorar la expiración de tokens
- ❌ No hardcodear el secret JWT en el código
- ❌ No dar acceso excesivo (principio de mínimo privilegio)

## 🔮 Funcionalidades Futuras

### 1. Refresh Tokens

```typescript
@Post('refresh')
async refresh(@Body() refreshDto: RefreshTokenDto): Promise<AuthResponseDto> {
  return this.authService.refreshAccessToken(refreshDto.refreshToken);
}
```

### 2. Blacklist de Tokens

Invalidar tokens antes de su expiración (logout, cambio de contraseña).

### 3. Rate Limiting por Usuario

Limitar requests por usuario autenticado.

### 4. Auditoría

Registrar accesos a endpoints protegidos.

### 5. Permisos Granulares

Más allá de roles, implementar permisos específicos.

## 🔗 Archivos Relacionados

- `src/presentation/strategies/jwt.strategy.ts` - Estrategia JWT
- `src/presentation/guards/jwt-auth.guard.ts` - Guard de autenticación
- `src/presentation/guards/roles.guard.ts` - Guard de roles
- `src/presentation/decorators/current-user.decorator.ts` - Decorator CurrentUser
- `src/presentation/decorators/roles.decorator.ts` - Decorator Roles
- `src/modules/auth/auth.module.ts` - Módulo de autenticación
- `src/presentation/controllers/users.controller.ts` - Ejemplo de uso
- `scripts/test-protected-endpoints.js` - Script de pruebas

---

**Última actualización**: Marzo 2026  
**Estado**: ✅ Implementado y probado  
**Versión JWT**: passport-jwt 4.0.1
