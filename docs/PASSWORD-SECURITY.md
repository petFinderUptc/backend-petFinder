# Seguridad de Contraseñas - Implementación con bcrypt

## 📋 Descripción General

Este documento describe la implementación de hash seguro de contraseñas utilizando bcrypt en el backend de PetFinder.

## 🔐 ¿Por qué bcrypt?

bcrypt es un algoritmo de hash diseñado específicamente para contraseñas con las siguientes características:

1. **Lentitud intencional**: Diseñado para ser computacionalmente costoso, dificultando ataques de fuerza bruta
2. **Salt automático**: Cada contraseña tiene un salt único generado automáticamente
3. **Resistente a rainbow tables**: Gracias al uso de salts únicos
4. **Ajustable**: El parámetro "rounds" permite aumentar la seguridad con el tiempo

## 🏗️ Arquitectura

### PasswordHashService

Servicio centralizado que encapsula toda la lógica de hash y validación de contraseñas.

**Ubicación**: `src/application/services/password-hash.service.ts`

```typescript
@Injectable()
export class PasswordHashService {
  async hash(password: string): Promise<string>
  async compare(password: string, hashedPassword: string): Promise<boolean>
  isHashValid(hash: string): boolean
  needsRehash(hashedPassword: string): boolean
  getSaltRounds(): number
}
```

### Integración

```
┌─────────────────┐
│ AuthController  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  AuthService    │─────►│ PasswordHashService│
└────────┬────────┘      └──────────────────┘
         │                         ▲
         ▼                         │
┌─────────────────┐               │
│  UsersService   │───────────────┘
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  UserRepository │
└─────────────────┘
```

## ⚙️ Configuración

### Variables de Entorno

```env
# .env
BCRYPT_SALT_ROUNDS=12
```

**Valores recomendados**:
- **10 rounds**: ~10 hashes/segundo (desarrollo)
- **12 rounds**: ~5 hashes/segundo (producción, recomendado)
- **14 rounds**: ~1 hash/segundo (alta seguridad)

### Configuración en código

**Archivo**: `src/config/configuration.ts`

```typescript
security: {
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
}
```

## 🔄 Flujo de Registro

```
1. Usuario envía credenciales
   ↓
2. RegisterDto valida formato (class-validator)
   ↓
3. UsersService verifica unicidad
   ↓
4. PasswordHashService.hash(password)
   ├─ bcrypt genera salt aleatorio
   ├─ Combina salt + password
   └─ Genera hash (60 caracteres)
   ↓
5. Se almacena hash en base de datos
   ↓
6. Se retorna usuario SIN contraseña
```

### Ejemplo de hash generado

```
Input:  "mySecurePassword123!"
Output: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYWv3MIOm3K"
         │  │  │                                                      │
         │  │  └─ Salt (22 caracteres)                               │
         │  └─ Número de rounds (12)                                 │
         └─ Versión de bcrypt (2b)                                   │
                                                                      │
                                          Hash final (31 caracteres)─┘
```

## 🔑 Flujo de Login

```
1. Usuario envía credenciales
   ↓
2. LoginDto valida formato
   ↓
3. AuthService busca usuario por email
   ↓
4. PasswordHashService.compare(password, hash)
   ├─ Extrae salt del hash almacenado
   ├─ Aplica mismo proceso al password ingresado
   └─ Compara resultados en tiempo constante
   ↓
5. Si coincide → Genera JWT
   Si no coincide → UnauthorizedException
```

## 📝 Uso en el Código

### Registro de Usuario

```typescript
// UsersService.create()
const hashedPassword = await this.passwordHashService.hash(
  createUserDto.password
);

const user = new User(
  '',
  createUserDto.email,
  createUserDto.username,
  hashedPassword, // ← Hash almacenado
  // ... otros campos
);
```

### Login de Usuario

```typescript
// AuthService.login()
const user = await this.usersService.findByEmail(loginDto.email);

const isPasswordValid = await this.passwordHashService.compare(
  loginDto.password,
  user.password
);

if (!isPasswordValid) {
  throw new UnauthorizedException('Credenciales inválidas');
}
```

## 🛡️ Características de Seguridad

### 1. Salt único por contraseña

```typescript
// Dos usuarios con la misma contraseña tendrán hashes diferentes
User1: "password123" → "$2b$12$A1B2C3D4..."
User2: "password123" → "$2b$12$X9Y8Z7W6..."
```

### 2. Comparación en tiempo constante

bcrypt usa comparación en tiempo constante para prevenir ataques de timing.

### 3. Detección de rehash necesario

```typescript
// Si se incrementan los salt rounds, detectar hashes antiguos
if (this.passwordHashService.needsRehash(user.password)) {
  // Actualizar hash en el próximo login exitoso
}
```

### 4. Validación de formato de hash

```typescript
if (!this.passwordHashService.isHashValid(hash)) {
  throw new Error('Hash de contraseña inválido');
}
```

## 🧪 Testing

### Test unitario de PasswordHashService

```typescript
describe('PasswordHashService', () => {
  it('debe hashear una contraseña correctamente', async () => {
    const password = 'testPassword123';
    const hash = await service.hash(password);
    
    expect(hash).toBeDefined();
    expect(hash.length).toBe(60);
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it('debe comparar contraseñas correctamente', async () => {
    const password = 'testPassword123';
    const hash = await service.hash(password);
    
    const isValid = await service.compare(password, hash);
    expect(isValid).toBe(true);
    
    const isInvalid = await service.compare('wrongPassword', hash);
    expect(isInvalid).toBe(false);
  });

  it('no debe generar el mismo hash para la misma contraseña', async () => {
    const password = 'testPassword123';
    const hash1 = await service.hash(password);
    const hash2 = await service.hash(password);
    
    expect(hash1).not.toBe(hash2);
  });
});
```

### Test manual con script

```bash
node scripts/test-password-hash.js
```

## 🚨 Mejores Prácticas

### ✅ DO (Hacer)

- ✅ Usar PasswordHashService para todo hash de contraseñas
- ✅ Configurar salt rounds apropiados para producción (12+)
- ✅ Nunca exponer contraseñas en logs o respuestas
- ✅ Validar formato de contraseña antes de hashear
- ✅ Usar UserResponseDto para excluir contraseñas de respuestas

### ❌ DON'T (No hacer)

- ❌ No usar bcrypt directamente en controladores
- ❌ No almacenar contraseñas en texto plano
- ❌ No usar MD5, SHA1, o SHA256 para contraseñas
- ❌ No reducir salt rounds por rendimiento
- ❌ No incluir contraseñas hasheadas en logs

## 📊 Rendimiento

| Salt Rounds | Tiempo por hash | Hashes/segundo | Nivel de seguridad |
|-------------|-----------------|----------------|-------------------|
| 8           | ~42ms           | ~24           | Bajo (no recomendado) |
| 10          | ~109ms          | ~9            | Aceptable |
| **12**      | **~428ms**      | **~2.3**      | **Recomendado** ✅ |
| 14          | ~1.7s           | ~0.6          | Alto |
| 16          | ~6.8s           | ~0.15         | Muy alto (overkill) |

**Nota**: Los tiempos son aproximados y varían según el hardware.

## 🔮 Funcionalidades Futuras

### 1. Rehash automático en login

```typescript
// Si el hash usa menos rounds que el configurado actual
if (this.passwordHashService.needsRehash(user.password)) {
  const newHash = await this.passwordHashService.hash(password);
  await this.userRepository.updatePassword(user.id, newHash);
}
```

### 2. Reset de contraseña

```typescript
async resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await this.verifyResetToken(token);
  const hashedPassword = await this.passwordHashService.hash(newPassword);
  await this.userRepository.updatePassword(user.id, hashedPassword);
}
```

### 3. Cambio de contraseña

```typescript
async changePassword(
  userId: string, 
  oldPassword: string, 
  newPassword: string
): Promise<void> {
  const user = await this.userRepository.findById(userId);
  
  const isValid = await this.passwordHashService.compare(
    oldPassword, 
    user.password
  );
  
  if (!isValid) {
    throw new UnauthorizedException('Contraseña actual incorrecta');
  }
  
  const hashedPassword = await this.passwordHashService.hash(newPassword);
  await this.userRepository.updatePassword(userId, hashedPassword);
}
```

## 📚 Referencias

- [bcrypt npm package](https://www.npmjs.com/package/bcrypt)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [How bcrypt works](https://auth0.com/blog/hashing-in-action-understanding-bcrypt/)

## 🔗 Archivos Relacionados

- `src/application/services/password-hash.service.ts` - Servicio principal
- `src/application/services/users.service.ts` - Uso en registro
- `src/application/services/auth.service.ts` - Uso en login
- `src/config/configuration.ts` - Configuración
- `.env.example` - Variables de entorno
- `docs/REGISTER-ENDPOINT.md` - Documentación del endpoint de registro

---

**Última actualización**: Marzo 2026  
**Versión bcrypt**: 5.1.1  
**Salt rounds en producción**: 12
