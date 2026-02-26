# 🏗️ Decisiones de Arquitectura - Backend PetFinder

## 📋 Tabla de Contenidos
1. [Stack Tecnológico](#stack-tecnológico)
2. [Patrones de Arquitectura](#patrones-de-arquitectura)
3. [Estructura de Módulos](#estructura-de-módulos)
4. [Decisiones Técnicas](#decisiones-técnicas)
5. [Futuras Mejoras](#futuras-mejoras)

---

## 🛠️ Stack Tecnológico

### ¿Por qué NestJS?

**Elegido sobre Express puro, Fastify, o Koa por:**

✅ **Arquitectura Opinada**: NestJS impone una estructura que facilita el crecimiento del proyecto
- Express es demasiado flexible (libertad = desorden en equipos grandes)
- NestJS te obliga a seguir mejores prácticas

✅ **TypeScript First**: Tipado fuerte desde el inicio
- Menos errores en runtime
- Mejor autocompletado en IDE
- Refactoring más seguro

✅ **Inyección de Dependencias Nativa**:
- Facilita testing (mocking de servicios)
- Código más mantenible y testeable
- Similar a Spring Boot (familiar para devs Java)

✅ **Decoradores Potentes**:
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController { }
```
- Código más limpio y declarativo
- Menos boilerplate

✅ **Ecosistema Completo**:
- CLI para generar código
- Integración nativa con Passport, JWT, Swagger
- Gran comunidad y documentación

---

## 🏛️ Patrones de Arquitectura

### 1. Arquitectura por Capas (Layered Architecture)

```
┌─────────────────────────────────┐
│      Controllers (HTTP)         │  ← Maneja requests/responses
├─────────────────────────────────┤
│      Services (Business Logic)  │  ← Lógica de negocio
├─────────────────────────────────┤
│      Repositories (Data Access) │  ← Acceso a datos (FASE 2)
├─────────────────────────────────┤
│      Database (Cosmos DB)       │  ← Persistencia (FASE 2)
└─────────────────────────────────┘
```

**¿Por qué esta arquitectura?**

✅ **Separación de Responsabilidades**:
- Controller solo conoce HTTP
- Service solo conoce lógica de negocio
- Repository solo conoce la base de datos

✅ **Fácil de Testear**:
```typescript
// Testear service sin controllers ni BD
const service = new UsersService(mockRepository);
```

✅ **Cambios Aislados**:
- Cambiar de Cosmos DB a MongoDB solo afecta Repository
- Cambiar validaciones solo afecta DTOs
- Agregar nuevo endpoint solo afecta Controller

---

### 2. Módulos por Feature (Feature Modules)

```
modules/
├── auth/      ← Todo lo de autenticación
├── users/     ← Todo lo de usuarios
└── posts/     ← Todo lo de publicaciones
```

**¿Por qué módulos por feature y no por tipo técnico?**

❌ **MALA PRÁCTICA** (por tipo técnico):
```
src/
├── controllers/
│   ├── auth.controller.ts
│   ├── users.controller.ts
│   └── posts.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── users.service.ts
│   └── posts.service.ts
```

✅ **BUENA PRÁCTICA** (por feature):
```
modules/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
```

**Ventajas:**
- Todo relacionado con una feature está junto
- Fácil de navegar el código
- Se puede extraer a microservicio si crece mucho
- Equipo puede trabajar en paralelo (cada dev en un módulo)

---

### 3. DTOs para Validación

```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

**¿Por qué DTOs en vez de tipos genéricos?**

✅ **Validación Automática**:
```typescript
// NestJS valida automáticamente antes de llamar al controller
@Post()
create(@Body() dto: CreateUserDto) {
  // Aquí ya sabemos que dto es válido
}
```

✅ **Documentación Implícita**:
- Con Swagger, los DTOs se convierten en documentación automática
- El DTO es la única fuente de verdad

✅ **Type Safety**:
- TypeScript verifica que los datos tengan la forma correcta

---

## 🔧 Decisiones Técnicas

### 1. ¿Por qué Azure Cosmos DB y no PostgreSQL/MySQL?

**Cosmos DB elegido por:**

✅ **NoSQL = Flexibilidad**:
- Schema flexible para mascotas (cada una puede tener atributos diferentes)
- No necesitamos relaciones complejas

✅ **Escalabilidad Global**:
- Si PetFinder crece, Cosmos escala horizontalmente
- Multi-región automática

✅ **Geoespacial Nativo**:
- Búsqueda de mascotas por coordenadas GPS
- Índices geoespaciales para queries rápidas

✅ **Azure Native**:
- Todo en el mismo cloud provider
- Fácil integración con otros servicios de Azure

---

### 2. ¿Por qué JWT en vez de Sessions?

**JWT elegido por:**

✅ **Stateless**:
- No necesitamos guardar sesiones en servidor
- Fácil de escalar horizontalmente

✅ **Mobile-Friendly**:
- Tokens se pueden guardar en app móvil fácilmente
- No hay cookies en mobile

✅ **Microservicios Ready**:
- Si separamos en microservicios, todos pueden validar el JWT
- No necesitan compartir sesión

❌ **Desventaja**:
- No se puede "revocar" un token hasta que expire
- **Solución**: Refresh tokens + tokens de corta duración (FASE 2)

---

### 3. ¿Por qué bcrypt para passwords?

**bcrypt elegido por:**

✅ **Seguridad Probada**:
- Estándar de la industria
- Protege contra rainbow tables

✅ **Salt Automático**:
```typescript
await bcrypt.hash(password, 10); // El salt ya está incluido
```

✅ **Adaptive Hashing**:
- El factor de costo (10) se puede aumentar cuando los CPUs sean más rápidos

---

## 🚀 Futuras Mejoras

### FASE 2 (Próximos 1-2 meses)

1. **Conexión Real con Cosmos DB**
   - Implementar Repository pattern
   - Migraciones de datos

2. **Azure Blob Storage**
   - Upload de imágenes de mascotas
   - Thumbnails automáticos

3. **Guards y Autorización Completa**
   - JwtAuthGuard implementado
   - RolesGuard para admin/user

4. **Logging y Monitoring**
   - Winston para logs estructurados
   - Application Insights para telemetría

5. **CI/CD**
   - Pipeline en Azure DevOps
   - Deploy automático a Azure App Service

### FASE 3 (Mediano plazo)

1. **Matching Automático**
   - Algoritmo ML para detectar mascotas similares
   - Sistema de scoring por similitud

2. **Notificaciones en Tiempo Real**
   - WebSockets con Socket.io
   - Push notifications

3. **Sistema de Mensajería**
   - Chat entre usuarios
   - Historial de conversaciones

4. **Geolocalización Avanzada**
   - Integración con Azure Maps
   - Búsqueda por radio de distancia

### FASE 4 (Largo plazo - si el proyecto crece)

1. **Microservicios**
   - Separar matching en servicio independiente
   - Separar notificaciones

2. **Event-Driven Architecture**
   - Azure Service Bus para eventos
   - CQRS pattern si es necesario

3. **Cache Distribuido**
   - Redis para cachear publicaciones populares

---

## 📊 Métricas de Éxito

### Código de Calidad
- ✅ Test coverage > 80%
- ✅ 0 vulnerabilidades críticas (npm audit)
- ✅ ESLint sin warnings

### Performance
- ✅ Respuestas API < 200ms (p95)
- ✅ Uptime > 99.5%
- ✅ Soporte para 1000+ usuarios concurrentes

### Developer Experience
- ✅ Nuevo desarrollador puede levantar el proyecto en < 5 minutos
- ✅ Documentación actualizada
- ✅ CI/CD automatizado

---

## 🎓 Aprendizajes y Lecciones

### Lo que funcionó bien
1. ✅ Empezar con estructura sólida desde el inicio
2. ✅ Separar módulos por feature
3. ✅ Usar TypeScript + DTOs para validación

### Lo que mejoraríamos
1. ⚠️ Agregar tests desde el inicio (no dejarlo para después)
2. ⚠️ Documentar decisiones arquitectónicas en tiempo real
3. ⚠️ Implementar CI/CD desde día 1

---

**Esta arquitectura está diseñada para crecer con el proyecto. 🚀**

**Preparada para escalar desde MVP hasta producción a gran escala.**
