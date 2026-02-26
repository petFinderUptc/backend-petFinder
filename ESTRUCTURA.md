# 📂 Estructura de Carpetas - Backend PetFinder

Esta es la arquitectura completa del backend, organizada por capas y responsabilidades.

```
backend-petfinder/
│
├── src/                                    # Código fuente de la aplicación
│   │
│   ├── modules/                           # Módulos de negocio (feature modules)
│   │   │
│   │   ├── auth/                          # Módulo de autenticación
│   │   │   ├── dto/                       # Data Transfer Objects
│   │   │   │   └── auth.dto.ts           # DTOs para login/register
│   │   │   ├── strategies/                # Estrategias de Passport
│   │   │   │   └── jwt.strategy.ts       # Estrategia JWT (FASE 2)
│   │   │   ├── auth.controller.ts         # Controlador de autenticación
│   │   │   ├── auth.service.ts            # Lógica de autenticación
│   │   │   └── auth.module.ts             # Módulo de autenticación
│   │   │
│   │   ├── users/                         # Módulo de usuarios
│   │   │   ├── dto/                       # DTOs de usuario
│   │   │   │   └── user.dto.ts           # CreateUser, UpdateUser, UserResponse
│   │   │   ├── interfaces/                # Interfaces y tipos
│   │   │   │   └── user.interface.ts     # IUser, UserRole
│   │   │   ├── users.controller.ts        # Controlador de usuarios
│   │   │   ├── users.service.ts           # Lógica de negocio de usuarios
│   │   │   └── users.module.ts            # Módulo de usuarios
│   │   │
│   │   └── posts/                         # Módulo de publicaciones
│   │       ├── dto/                       # DTOs de publicaciones
│   │       │   └── post.dto.ts           # CreatePost, UpdatePost, FilterPost
│   │       ├── interfaces/                # Interfaces
│   │       │   └── post.interface.ts     # IPost, PostType, PostStatus, PetType
│   │       ├── posts.controller.ts        # Controlador de publicaciones
│   │       ├── posts.service.ts           # Lógica de negocio de publicaciones
│   │       └── posts.module.ts            # Módulo de publicaciones
│   │
│   ├── common/                            # Código compartido entre módulos
│   │   │
│   │   ├── decorators/                    # Decoradores personalizados
│   │   │   ├── current-user.decorator.ts # @CurrentUser() (FASE 2)
│   │   │   └── roles.decorator.ts        # @Roles() (FASE 2)
│   │   │
│   │   ├── guards/                        # Guards de autorización
│   │   │   ├── jwt-auth.guard.ts         # Guard JWT (FASE 2)
│   │   │   └── roles.guard.ts            # Guard de roles (FASE 2)
│   │   │
│   │   ├── filters/                       # Exception filters
│   │   │   └── http-exception.filter.ts  # Filtro de excepciones HTTP (FASE 2)
│   │   │
│   │   ├── interceptors/                  # Interceptores HTTP
│   │   │   ├── transform.interceptor.ts  # Transformar respuestas (FASE 2)
│   │   │   └── logging.interceptor.ts    # Logging de requests (FASE 2)
│   │   │
│   │   ├── pipes/                         # Pipes de validación
│   │   │   └── parse-objectid.pipe.ts    # Validar ObjectId (FASE 2)
│   │   │
│   │   └── interfaces/                    # Interfaces compartidas
│   │       └── api-response.interface.ts # Formato de respuestas API
│   │
│   ├── config/                            # Configuración de la aplicación
│   │   └── configuration.ts               # Variables de entorno centralizadas
│   │
│   ├── app.module.ts                      # Módulo raíz de la aplicación
│   └── main.ts                            # Punto de entrada de la aplicación
│
├── test/                                   # Tests E2E
│   ├── app.e2e-spec.ts                    # Test E2E de ejemplo
│   └── jest-e2e.json                      # Configuración de Jest para E2E
│
├── .env                                    # Variables de entorno (no subir a git)
├── .env.example                            # Ejemplo de variables de entorno
├── .gitignore                              # Archivos ignorados por git
├── .eslintrc.js                            # Configuración de ESLint
├── .prettierrc                             # Configuración de Prettier
├── nest-cli.json                           # Configuración de Nest CLI
├── tsconfig.json                           # Configuración de TypeScript
├── package.json                            # Dependencias y scripts
└── README.md                               # Documentación del proyecto
```

---

## 📋 Explicación de la Estructura

### 🎯 **Por qué está organizado así**

#### **1. Separación por Módulos (modules/)**
Cada módulo representa una **funcionalidad específica** del negocio:
- ✅ **auth**: Todo lo relacionado con autenticación (login, registro, tokens)
- ✅ **users**: Gestión de usuarios del sistema
- ✅ **posts**: Publicaciones de mascotas perdidas/encontradas

**Ventajas:**
- Fácil de escalar: agregar un nuevo módulo no afecta los existentes
- Código organizado por dominio de negocio
- Facilita el trabajo en equipo (cada dev puede trabajar en un módulo)

#### **2. Arquitectura por Capas dentro de cada módulo**
```
Controller → Service → Repository → Database
```

- **Controller**: Maneja requests HTTP (qué entra y qué sale)
- **Service**: Contiene la lógica de negocio
- **Repository**: Acceso a datos (FASE 2 con Cosmos DB)

**Ventajas:**
- Responsabilidad única (SOLID)
- Fácil de testear cada capa por separado
- Lógica de negocio independiente de la tecnología

#### **3. Common (código compartido)**
Todo lo que se usa en **múltiples módulos** va aquí:
- Guards: protección de rutas
- Decorators: lógica reutilizable
- Filters: manejo de errores
- Interceptors: transformación de requests/responses
- Interfaces: tipos compartidos

**Ventajas:**
- DRY (Don't Repeat Yourself)
- Consistencia en toda la API
- Fácil mantenimiento

#### **4. Config (configuración centralizada)**
Todas las variables de entorno en un solo lugar.

**Ventajas:**
- Fácil de cambiar configuración
- Type-safe con TypeScript
- Listo para diferentes ambientes (dev, prod, test)

#### **5. DTOs separados**
Los DTOs definen la estructura de datos que entra/sale de la API.

**Ventajas:**
- Validación automática con class-validator
- Documentación implícita del API
- Type safety en toda la app

---

## 🚀 Próximos Pasos (FASE 2)

1. ✅ Conectar Azure Cosmos DB
2. ✅ Implementar guards de autenticación (JwtAuthGuard)
3. ✅ Implementar upload de imágenes a Azure Blob Storage
4. ✅ Agregar paginación a listados
5. ✅ Implementar tests unitarios
6. ✅ Configurar CI/CD en Azure DevOps

---

## 🔮 Funcionalidades Futuras (FASE 3)

- 🤖 **Matching automático** entre mascotas perdidas/encontradas
- 📍 **Búsqueda geoespacial** por coordenadas
- 💬 **Sistema de mensajería** entre usuarios
- 🔔 **Notificaciones push** cuando hay matches
- 📧 **Emails automáticos** para alertas

---

## 💡 Principios Aplicados

✅ **SOLID**
- Single Responsibility: cada clase tiene una responsabilidad
- Dependency Injection: usando decoradores de NestJS
- Open/Closed: fácil de extender sin modificar código existente

✅ **Clean Architecture**
- Separación de dominio e infraestructura
- Lógica de negocio independiente de frameworks

✅ **Escalabilidad**
- Estructura modular
- Fácil agregar nuevos módulos
- Preparado para microservicios (si se necesita en el futuro)

---

**Esta estructura está lista para crecer profesionalmente. 🚀**
