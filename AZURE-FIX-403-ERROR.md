# 🔧 Solución Error 403 - Azure App Service

## 🔴 PROBLEMA
Tu aplicación muestra **"Error 403 - This web app is stopped"** porque Azure no puede iniciarla correctamente.

## ✅ SOLUCIÓN (SIGUE ESTOS PASOS)

---

### **PASO 1: Agregar Variables de Entorno en Azure Portal** ⚡ CRÍTICO

Las variables del `.env` local **NO se transfieren a Azure**. Debes agregarlas manualmente:

1. **Ve a Azure Portal:** https://portal.azure.com
2. **Busca tu App Service** (backend-petfinder o como lo hayas llamado)
3. **Settings → Configuration → Application settings**
4. **Click en "+ New application setting"** para cada variable:

```
NODE_ENV = production
PORT = 8080
API_PREFIX = api/v1
JWT_SECRET = mi-clave-super-secreta-2024
JWT_EXPIRATION = 7d
BCRYPT_SALT_ROUNDS = 12

# CORS - Permitir todos los orígenes por ahora (cambiar después)
CORS_ORIGINS = *

# Rate Limiting
THROTTLE_TTL = 60
THROTTLE_LIMIT = 10

# Azure Cosmos DB (USA TUS CREDENCIALES REALES)
COSMOS_DB_ENDPOINT = https://tu-cuenta-cosmosdb.documents.azure.com:443/
COSMOS_DB_KEY = TU-COSMOS-PRIMARY-KEY-AQUI
COSMOS_DB_DATABASE = petfinder
```

5. **⚠️ IMPORTANTE:** Click en **"Save"** arriba (espera a que reinicie)

---

### **PASO 2: Configurar Startup Command** 🚀

Azure necesita saber cómo iniciar tu aplicación:

1. **En Azure Portal → Tu App Service → Settings → Configuration**
2. **Pestaña "General settings"**
3. **Startup Command:** Agrega uno de estos (depende si es Linux o Windows):

**Si tu App Service es LINUX:**
```bash
npm run start:prod
```

**Si tu App Service es WINDOWS:**
```
node dist/main.js
```

**No estás seguro? Usa este:**
```bash
node dist/main.js
```

4. **Click "Save"** y espera el reinicio

---

### **PASO 3: Verificar Stack Settings** 📦

1. **En Configuration → General settings**
2. **Stack:** Node
3. **Major version:** 20 LTS
4. **Minor version:** 20 LTS (o la más reciente)
5. **Save**

---

### **PASO 4: Forzar Redespliegue (Si es necesario)** 🔄

Si aún no funciona después de los pasos anteriores:

**Opción A - Desde Azure Portal:**
1. **Deployment Center → tu repositorio**
2. **Click en "Sync"** o **"Redeploy"**
3. Espera 2-5 minutos

**Opción B - Desde tu proyecto local:**
```bash
# Hacer un commit dummy para forzar redespliegue
git commit --allow-empty -m "chore: trigger azure deployment"
git push origin main
```

---

### **PASO 5: Habilitar Logs para Diagnóstico** 🔍

Habilita los logs para ver qué está pasando:

1. **Azure Portal → Tu App Service → Monitoring → App Service logs**
2. **Application Logging:** On (File System)
3. **Level:** Information
4. **Web server logging:** On
5. **Detailed error messages:** On
6. **Save**

**Ver logs en tiempo real:**
```bash
# Si tienes Azure CLI instalado:
az webapp log tail --name TU-APP-SERVICE-NAME --resource-group TU-RESOURCE-GROUP
```

**O en Azure Portal:**
- **Monitoring → Log stream**

---

## 🔍 VERIFICACIONES POST-CONFIGURACIÓN

### 1. **Health Check de la Aplicación**

Una vez configurado todo, verifica estos endpoints:

```bash
# Root endpoint
https://tu-app.azurewebsites.net/

# Health endpoint
https://tu-app.azurewebsites.net/health

# Info endpoint
https://tu-app.azurewebsites.net/info

# API endpoint
https://tu-app.azurewebsites.net/api/v1/auth/login
```

### 2. **Ver Logs de Errores**

Si aún falla, ve a:
- **Azure Portal → App Service → Diagnose and solve problems**
- **O → Monitoring → Log stream**

Busca errores como:
- ❌ Missing environment variables
- ❌ Cannot find module
- ❌ Connection to Cosmos DB failed

---

## 📋 CHECKLIST COMPLETA

Marca cada paso completado:

- [ ] Variables de entorno agregadas en Azure Configuration
- [ ] Startup Command configurado (npm run start:prod o node dist/main.js)
- [ ] Stack configurado a Node 20 LTS
- [ ] Logs habilitados
- [ ] App Service reiniciado (Save en Configuration)
- [ ] Esperado 2-5 minutos después del reinicio
- [ ] Probado endpoint / (root)
- [ ] Probado endpoint /health
- [ ] Sin errores en Log stream

---

## 🚨 ERRORES COMUNES Y SOLUCIONES

### **Error: "Application Error" después de configurar**

**Causa:** Falta alguna variable de entorno crítica

**Solución:**
1. Ve a Log stream y busca el error exacto
2. Probablemente falta `JWT_SECRET` o `COSMOS_DB_*`
3. Verifica que TODAS las variables estén en Configuration

---

### **Error: "Cannot find module 'dist/main'"**

**Causa:** El código no se compiló (no hay carpeta dist/)

**Solución:**
1. Verifica que en **Deployment Center** el build haya completado
2. O agrega en **Configuration → General settings → Startup Command:**
   ```bash
   npm ci && npm run build && npm run start:prod
   ```

---

### **Error: "Connection refused to Cosmos DB"**

**Causa:** Credenciales incorrectas o Cosmos DB no permite acceso desde Azure

**Solución:**
1. Verifica las variables `COSMOS_DB_*` en Configuration
2. Ve a Cosmos DB en Azure Portal
3. **Settings → Firewall and virtual networks**
4. Habilita: **"Allow access from Azure services"** ✅
5. O agrega la IP de tu App Service

---

### **Error: "CORS policy" en frontend**

**Causa:** La variable CORS_ORIGINS no incluye tu frontend

**Solución:**
1. Actualiza `CORS_ORIGINS` en Configuration:
   ```
   CORS_ORIGINS = https://tu-frontend.azurewebsites.net,*
   ```
2. Save y reinicia

---

## 📞 SI NADA FUNCIONA

Ejecuta este comando en PowerShell (si tienes Azure CLI):

```bash
# Ver logs en tiempo real
az webapp log tail --name TU-APP-NAME --resource-group TU-RESOURCE-GROUP

# Ver configuración actual
az webapp config appsettings list --name TU-APP-NAME --resource-group TU-RESOURCE-GROUP

# Restart forzado
az webapp restart --name TU-APP-NAME --resource-group TU-RESOURCE-GROUP
```

---

## ✅ RESULTADO ESPERADO

Después de seguir todos los pasos, deberías ver:

```json
// https://tu-app.azurewebsites.net/
{
  "status": "ok",
  "message": "PetFinder Backend API is running",
  "timestamp": "2026-03-09T...",
  "environment": "production",
  "apiPrefix": "/api/v1"
}
```

```json
// https://tu-app.azurewebsites.net/health
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2026-03-09T..."
}
```

---

## 📚 DOCUMENTACIÓN ADICIONAL

- [Azure App Service - Node.js](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs)
- [Troubleshoot Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/troubleshoot-diagnostic-logs)
- [NestJS Production Deployment](https://docs.nestjs.com/deployment)

---

## 🎯 RESUMEN RÁPIDO (30 segundos)

1. Azure Portal → Tu App Service → Configuration
2. Agregar TODAS las variables de entorno (las que están arriba)
3. Configuration → General settings → Startup Command: `npm run start:prod`
4. Save y esperar 2-5 minutos
5. Probar: `https://tu-app.azurewebsites.net/health`

Si ves `{"status":"healthy"}` → **¡FUNCIONA!** ✅
