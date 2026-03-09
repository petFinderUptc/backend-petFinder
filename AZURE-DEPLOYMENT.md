# Guía de Despliegue en Azure

## Configuración de Variables de Entorno en Azure App Service

Después de desplegar el backend en Azure App Service, debes configurar las siguientes variables de entorno en el **Azure Portal**:

### Pasos:
1. Ve a Azure Portal → Tu App Service
2. Navega a **Configuration** → **Application settings**
3. Agrega las siguientes variables:

### Variables Requeridas para Producción:

```
NODE_ENV=production
PORT=8080
API_PREFIX=api/v1

# JWT - IMPORTANTE: Cambiar por un secreto seguro
JWT_SECRET=GENERAR-UN-SECRET-ALEATORIO-SEGURO-DE-AL-MENOS-32-CARACTERES
JWT_EXPIRATION=7d

# CORS - URL del frontend en Azure Static Web Apps
CORS_ORIGINS=https://kind-water-085d48310.2.azurestaticapps.net

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Password Hashing
BCRYPT_SALT_ROUNDS=12
```

### URLs de Producción:

- **Frontend:** https://kind-water-085d48310.2.azurestaticapps.net
- **Backend:** https://petfinder-backend-api-ajhrh9b6dbeueefy.centralus-01.azurewebsites.net/api/v1

### Verificación:

Después de configurar las variables, **reinicia el App Service** y verifica:

1. **Health Check:**
   ```bash
   curl https://petfinder-backend-api-ajhrh9b6dbeueefy.centralus-01.azurewebsites.net/api/v1
   ```

2. **CORS:** Verifica que las peticiones desde el frontend sean aceptadas

3. **Authentication:** Prueba registro y login desde el frontend desplegado

### Notas Importantes:

- ✅ El archivo `.env` NO se incluye en el repositorio por seguridad
- ✅ Todas las configuraciones sensibles deben estar en Azure Portal
- ✅ Cambiar `JWT_SECRET` por un valor único y seguro en producción
- ✅ Agregar más orígenes a `CORS_ORIGINS` si hay múltiples dominios
