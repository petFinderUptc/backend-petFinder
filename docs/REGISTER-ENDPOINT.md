# Endpoint de Registro - Documentación

## 📌 Descripción

Endpoint para registrar nuevos usuarios en el sistema con validaciones completas usando `class-validator`.

## 🔗 URL

```
POST /auth/register
```

## 📥 Request Body

```json
{
  "email": "usuario@example.com",
  "username": "nombreusuario",
  "password": "Password123!",
  "firstName": "Nombre",
  "lastName": "Apellido"
}
```

### Validaciones

| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| `email` | string | ✅ Sí | Formato de email válido |
| `username` | string | ✅ Sí | 3-20 caracteres, solo alfanuméricos, guiones y guiones bajos (`a-zA-Z0-9_-`) |
| `password` | string | ✅ Sí | Mínimo 8 caracteres, máximo 50 |
| `firstName` | string | ✅ Sí | Mínimo 2 caracteres, máximo 50 |
| `lastName` | string | ✅ Sí | Mínimo 2 caracteres, máximo 50 |

## 📤 Respuestas

### ✅ 201 Created - Registro exitoso

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@example.com",
    "username": "nombreusuario",
    "firstName": "Nombre",
    "lastName": "Apellido"
  }
}
```

**Nota importante:** La contraseña NO se incluye en la respuesta por seguridad.

### ❌ 400 Bad Request - Validación fallida

#### Email ya registrado
```json
{
  "statusCode": 400,
  "message": "El email ya está registrado",
  "error": "Bad Request"
}
```

#### Username ya en uso
```json
{
  "statusCode": 400,
  "message": "El username ya está en uso",
  "error": "Bad Request"
}
```

#### Validación de formato (class-validator)
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "username must match /^[a-zA-Z0-9_-]{3,20}$/ regular expression",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

## 🧪 Pruebas

### Usando cURL

```bash
# Registro exitoso
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Usando el script de prueba

```bash
# Asegúrate de tener el servidor corriendo
npm run start:dev

# En otra terminal, ejecuta el script de prueba
node scripts/test-register.js
```

El script probará automáticamente:
- ✅ Registro exitoso (201)
- ❌ Email duplicado (400)
- ❌ Username duplicado (400)
- ❌ Email inválido (400)
- ❌ Username con caracteres inválidos (400)
- ❌ Contraseña muy corta (400)
- ❌ Campos faltantes (400)

## 🔐 Seguridad

1. **Contraseñas**: Se hashean usando `bcrypt` antes de almacenarlas
2. **Respuesta**: La contraseña nunca se devuelve en la respuesta
3. **Validación**: Todas las entradas se validan usando `class-validator`
4. **Unicidad**: Email y username deben ser únicos en el sistema
5. **Token JWT**: Se genera automáticamente al registrarse

## 📝 Notas Técnicas

- La validación de unicidad se realiza a nivel de servicio
- Cosmos DB tiene unique keys configuradas para `/email` y `/username`
- El token JWT incluye el `id` y `email` del usuario en el payload
- La respuesta incluye el token JWT y la información básica del usuario

## 🚀 Próximos pasos

- [ ] Implementar verificación de email
- [ ] Agregar límite de intentos de registro
- [ ] Implementar CAPTCHA para prevenir spam
- [ ] Agregar logs de auditoría para registros
