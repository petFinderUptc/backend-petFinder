# 🐾 PetFinder Backend API

Backend API para plataforma de búsqueda y reencuentro de mascotas perdidas.

## 📋 Descripción

PetFinder es una plataforma web diseñada para facilitar el reencuentro de mascotas perdidas con sus dueños. Este backend proporciona la API REST necesaria para gestionar publicaciones de mascotas perdidas/encontradas, usuarios, autenticación y futuras funcionalidades de matching automático.

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura por capas** con separación clara de responsabilidades:

```
Controller → Service → Repository → Database
```

### Principios aplicados:
- ✅ Inyección de dependencias
- ✅ Responsabilidad única (SOLID)
- ✅ Separación de concerns
- ✅ Código escalable y mantenible

## 🛠️ Stack Tecnológico

- **Framework**: NestJS
- **Lenguaje**: TypeScript
- **Base de Datos**: Azure Cosmos DB (NoSQL) *(preparado para futura integración)*
- **Storage**: Azure Blob Storage *(preparado para futura integración)*
- **Autenticación**: JWT
- **Validación**: class-validator
- **CI/CD**: Azure DevOps *(preparado)*

## 📁 Estructura del Proyecto

```
backend-petfinder/
├── src/
│   ├── modules/              # Módulos de negocio
│   │   ├── auth/            # Autenticación y autorización
│   │   ├── users/           # Gestión de usuarios
│   │   └── posts/           # Publicaciones de mascotas
│   ├── common/              # Código compartido
│   │   ├── decorators/      # Decoradores personalizados
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Guards de autorización
│   │   ├── interceptors/    # Interceptores HTTP
│   │   ├── pipes/           # Pipes de validación
│   │   └── interfaces/      # Interfaces compartidas
│   ├── config/              # Configuración de la aplicación
│   │   └── configuration.ts # Variables de entorno
│   ├── app.module.ts        # Módulo raíz
│   └── main.ts              # Punto de entrada
├── test/                     # Tests E2E
├── .env                      # Variables de entorno (local)
├── .env.example              # Ejemplo de variables
└── package.json
```

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
npm run lint           # Ejecutar linter
npm run format         # Formatear código
npm run test           # Ejecutar tests unitarios
npm run test:e2e       # Ejecutar tests E2E
```

## 🔐 Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** para la autenticación. Los endpoints protegidos requieren un token Bearer en el header:

```
Authorization: Bearer <token>
```

## 📡 Endpoints Principales

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Login

### Usuarios
- `GET /api/v1/users/profile` - Obtener perfil
- `PUT /api/v1/users/profile` - Actualizar perfil

### Publicaciones
- `POST /api/v1/posts` - Crear publicación
- `GET /api/v1/posts` - Listar publicaciones
- `GET /api/v1/posts/:id` - Obtener detalle
- `PUT /api/v1/posts/:id` - Actualizar publicación
- `DELETE /api/v1/posts/:id` - Eliminar publicación

## 🔮 Roadmap de Funcionalidades

### ✅ Fase 1 (Actual)
- Estructura base del proyecto
- Módulos principales
- Autenticación JWT (estructura)
- DTOs y validaciones básicas

### 🚧 Fase 2 (Próximamente)
- Integración con Azure Cosmos DB
- Upload de imágenes a Azure Blob Storage
- Guards y middleware de autorización
- Validaciones avanzadas

### 📅 Fase 3 (Futuro)
- Matching automático de mascotas
- Notificaciones en tiempo real
- Geolocalización con mapas
- Sistema de mensajería entre usuarios

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:cov
```

## 📦 Deployment

El proyecto está preparado para despliegue en **Azure** con CI/CD mediante **Azure DevOps**.

## 👥 Equipo

Desarrollado por el equipo de PetFinder - Seminario de Grado UPTC

## 📄 Licencia

UNLICENSED - Proyecto académico
