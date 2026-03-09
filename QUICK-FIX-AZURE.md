# ⚡ SOLUCIÓN RÁPIDA - Error 403 Azure (5 minutos)

## 🎯 EL PROBLEMA
Tu app muestra "Error 403 - This web app is stopped" porque **faltan las variables de entorno en Azure**.

Azure **NO lee el archivo .env local**, debes configurarlas manualmente.

---

## ✅ SOLUCIÓN (SIGUE ESTOS 3 PASOS)

### **PASO 1: Agregar Variables de Entorno en Azure** (3 min)

1. Ve a: **https://portal.azure.com**
2. Busca tu **App Service** (el backend)
3. Ve a: **Settings → Configuration → Application settings**
4. Click en **"+ New application setting"** y agrega estas **12 variables**:

```plaintext
Name: NODE_ENV
Value: production
---
Name: PORT
Value: 8080
---
Name: API_PREFIX
Value: api/v1
---
Name: JWT_SECRET
Value: mi-clave-super-secreta-2024
---
Name: JWT_EXPIRATION
Value: 7d
---
Name: BCRYPT_SALT_ROUNDS
Value: 12
---
Name: CORS_ORIGINS
Value: *
---
Name: THROTTLE_TTL
Value: 60
---
Name: THROTTLE_LIMIT
Value: 10
---
Name: COSMOS_DB_ENDPOINT
Value: https://tu-cuenta-cosmosdb.documents.azure.com:443/
---
Name: COSMOS_DB_KEY
Value: TU-COSMOS-PRIMARY-KEY-AQUI
---
Name: COSMOS_DB_DATABASE
Value: petfinder
```

5. **⚠️ CRÍTICO:** Click en **"Save"** arriba y espera a que reinicie (barra azul de progreso)

---

### **PASO 2: Configurar Startup Command** (1 min)

1. En la misma página **Configuration**
2. Click en pestaña **"General settings"**
3. En **"Startup Command"** escribe:

```bash
npm run start:prod
```

4. Click **"Save"** arriba
5. Espera el reinicio (1-2 minutos)

---

### **PASO 3: Verificar que Funciona** (1 min)

Abre tu navegador y prueba:

```
https://TU-APP.azurewebsites.net/health
```

**Resultado esperado:**
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2026-03-09T..."
}
```

Si ves esto → **¡FUNCIONA!** ✅

---

## 🔍 SI NO FUNCIONA AÚN

### **Ver los Logs para saber qué pasa:**

1. Azure Portal → Tu App Service
2. **Monitoring → Log stream**
3. Espera 30 segundos y verás los logs en tiempo real
4. Busca mensajes de error (texto en rojo)

### **Errores Comunes:**

**Error: "Missing environment variable: JWT_SECRET"**
→ Verifica que agregaste TODAS las 12 variables en el Paso 1

**Error: "Cannot find module 'dist/main'"**
→ Cambia el Startup Command a:
```bash
npm ci && npm run build && npm run start:prod
```

**Error: "Cannot connect to Cosmos DB"**
→ Verifica que las 3 variables COSMOS_DB_* estén correctas

---

## 📞 COMANDOS ÚTILES (Si tienes Azure CLI)

```bash
# Ver logs en tiempo real
az webapp log tail --name TU-APP-NAME --resource-group TU-RESOURCE-GROUP

# Ver todas las variables configuradas
az webapp config appsettings list --name TU-APP-NAME --resource-group TU-RESOURCE-GROUP

# Reiniciar la app
az webapp restart --name TU-APP-NAME --resource-group TU-RESOURCE-GROUP
```

---

## ✅ CHECKLIST

- [ ] Agregué las 12 variables de entorno
- [ ] Click en "Save" en Configuration
- [ ] Esperé el reinicio (barra azul completada)
- [ ] Configuré Startup Command: `npm run start:prod`
- [ ] Click en "Save" de nuevo
- [ ] Esperé 2 minutos
- [ ] Probé: `https://mi-app.azurewebsites.net/health`
- [ ] Responde con `{"status":"healthy"}` ✅

---

## 🎉 RESULTADO FINAL

Tu API debería responder en:

- **Root:** `https://tu-app.azurewebsites.net/`
- **Health:** `https://tu-app.azurewebsites.net/health`
- **Info:** `https://tu-app.azurewebsites.net/info`
- **API:** `https://tu-app.azurewebsites.net/api/v1/`

**Endpoints de Autenticación:**
- `POST https://tu-app.azurewebsites.net/api/v1/auth/register`
- `POST https://tu-app.azurewebsites.net/api/v1/auth/login`

---

## 📋 GUÍA VISUAL (CAPTURAS)

### Configuración → Application settings
```
[+ New application setting]
Name: NODE_ENV
Value: production
[OK]

... repetir para las 12 variables ...

[Save] ← ⚠️ NO OLVIDES ESTO
```

### General settings → Startup Command
```
Stack: Node
Major version: 20 LTS
Startup Command: npm run start:prod

[Save] ← ⚠️ IMPORTANTE
```

---

## 🆘 ¿NECESITAS AYUDA?

Si después de seguir todos los pasos aún no funciona:

1. Ve a **Log stream** y copia el mensaje de error exacto
2. Verifica que las 12 variables estén en Configuration
3. Comparte el error específico que ves en los logs

**La mayoría de los errores 403 se resuelven configurando las variables de entorno.**
