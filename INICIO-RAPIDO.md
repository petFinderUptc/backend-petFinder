# ⚡ Inicio Rápido - PetFinder Backend

## 🚀 Levantar el Proyecto en 5 Minutos

### Paso 1: Verificar Requisitos
```bash
# Verificar Node.js (debe ser >= 18)
node --version

# Verificar npm
npm --version
```

### Paso 2: Instalar Dependencias
```bash
npm install
```

### Paso 3: Configurar Variables de Entorno
```bash
# El archivo .env ya está creado con valores de desarrollo
# Para producción, actualiza los valores según tu entorno
```

### Paso 4: Ejecutar en Modo Desarrollo
```bash
npm run start:dev
```

✅ **¡Listo!** El servidor estará corriendo en `http://localhost:3000`

---

## 🧪 Probar los Endpoints

### 1️⃣ Registrar un Usuario
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Juan",
    "lastName": "Pérez"
  }'
```

### 2️⃣ Hacer Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Respuesta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "test@example.com",
    "firstName": "Juan",
    "lastName": "Pérez"
  }
}
```

### 3️⃣ Crear una Publicación de Mascota Perdida
```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{
    "type": "lost",
    "petName": "Max",
    "petType": "dog",
    "breed": "Labrador",
    "color": "Dorado",
    "size": "large",
    "description": "Perro grande, muy amigable, collar rojo",
    "location": {
      "city": "Tunja",
      "neighborhood": "Centro"
    },
    "contactPhone": "+573001234567",
    "lostOrFoundDate": "2026-02-25T10:00:00Z"
  }'
```

### 4️⃣ Listar Publicaciones con Filtros
```bash
# Todas las publicaciones
curl http://localhost:3000/api/v1/posts

# Solo mascotas perdidas
curl http://localhost:3000/api/v1/posts?type=lost

# Perros perdidos en Tunja
curl http://localhost:3000/api/v1/posts?type=lost&petType=dog&city=Tunja
```

---

## 📋 Comandos Útiles

```bash
# Desarrollo con hot-reload
npm run start:dev

# Build para producción
npm run build

# Ejecutar en producción
npm run start:prod

# Linter
npm run lint

# Formatear código
npm run format

# Tests
npm run test

# Tests con coverage
npm run test:cov

# Tests E2E
npm run test:e2e
```

---

## 🛠️ Generar Nuevos Recursos

### Crear un Módulo Completo
```bash
# Genera module, controller, service automáticamente
nest generate resource nombre-modulo
```

### Crear Componentes Individuales
```bash
nest generate module nombre
nest generate controller nombre
nest generate service nombre
```

---

## 📂 Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `src/main.ts` | Punto de entrada |
| `src/app.module.ts` | Módulo raíz |
| `.env` | Variables de entorno |
| `package.json` | Dependencias |

---

## 🐛 Solución de Problemas Comunes

### Error: "Puerto 3000 ya en uso"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error de TypeScript
```bash
# Limpiar build
rm -rf dist
npm run build
```

---

## 📚 Próximos Pasos

1. ✅ Levantar el proyecto
2. ✅ Probar endpoints con Postman o curl
3. 📖 Leer [ESTRUCTURA.md](./ESTRUCTURA.md) para entender la arquitectura
4. 📖 Leer [CONTRIBUTING.md](./CONTRIBUTING.md) para convenciones de código
5. 🔧 Empezar a desarrollar tu feature

---

## 🎓 Recursos de Aprendizaje

- [Documentación NestJS](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [class-validator Docs](https://github.com/typestack/class-validator)
- [JWT Explained](https://jwt.io/introduction)

---

## 💬 ¿Dudas?

1. Revisa la documentación en los archivos `.md`
2. Consulta los comentarios en el código (todos los TODOs están marcados)
3. Los archivos tienen ejemplos comentados para FASE 2

---

**¡Feliz Coding! 🚀**
