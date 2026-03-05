# 🚀 Guía de Configuración de Azure DevOps Pipeline

Esta guía te ayudará a configurar el pipeline de CI/CD en Azure DevOps para automatizar el build y despliegue del backend de PetFinder.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración en Azure](#configuración-en-azure)
3. [Configuración en Azure DevOps](#configuración-en-azure-devops)
4. [Variables de Entorno](#variables-de-entorno)
5. [Probar el Pipeline](#probar-el-pipeline)
6. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Requisitos Previos

### 1. Cuenta de Azure
- ✅ Suscripción activa de Azure
- ✅ Permisos de Owner o Contributor en la suscripción

### 2. Cuenta de Azure DevOps
- ✅ Organización creada en [https://dev.azure.com](https://dev.azure.com)
- ✅ Proyecto creado (ej: "PetFinder")

### 3. Repositorio
- ✅ Código en GitHub/Azure Repos
- ✅ Branches: `main` (producción) y `develop` (staging)

---

## ☁️ Configuración en Azure

### Paso 1: Crear Resource Group

```bash
# Opción 1: Azure Portal
# - Buscar "Resource groups"
# - Click "Create"
# - Name: petfinder-rg
# - Region: East US (o tu región preferida)

# Opción 2: Azure CLI
az group create \
  --name petfinder-rg \
  --location eastus
```

### Paso 2: Crear Azure App Service

```bash
# Crear App Service Plan (Linux)
az appservice plan create \
  --name petfinder-plan \
  --resource-group petfinder-rg \
  --is-linux \
  --sku B1

# Crear Web App (Node.js 20)
az webapp create \
  --name petfinder-backend-api \
  --resource-group petfinder-rg \
  --plan petfinder-plan \
  --runtime "NODE:20-lts"
```

**Importante**: El nombre `petfinder-backend-api` debe ser único globalmente. Si está ocupado, usa otro nombre (ej: `petfinder-backend-api-uptc`).

### Paso 3: Crear Staging Slot (Opcional)

```bash
# Crear slot de staging
az webapp deployment slot create \
  --name petfinder-backend-api \
  --resource-group petfinder-rg \
  --slot staging
```

### Paso 4: Configurar Variables de Entorno en Azure

```bash
# Configurar App Settings
az webapp config appsettings set \
  --name petfinder-backend-api \
  --resource-group petfinder-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    JWT_SECRET="tu-secret-super-seguro-aqui" \
    API_PREFIX="api/v1" \
    CORS_ORIGINS="https://tu-frontend.com"
```

---

## 🔄 Configuración en Azure DevOps

### Paso 1: Conectar Repositorio

1. Ve a tu proyecto en Azure DevOps
2. **Pipelines** → **Create Pipeline**
3. Selecciona dónde está tu código:
   - GitHub (recomendado) - Autoriza acceso
   - Azure Repos Git
4. Selecciona tu repositorio

### Paso 2: Usar el Pipeline Existente

1. Selecciona **"Existing Azure Pipelines YAML file"**
2. Branch: `feature/ARQ` (o `main`)
3. Path: `/azure-pipelines.yml`
4. Click **Continue**

### Paso 3: Configurar Service Connection

#### 3.1 Crear Service Connection a Azure

1. **Project Settings** (esquina inferior izquierda)
2. **Service connections** → **New service connection**
3. Selecciona **Azure Resource Manager**
4. Método de autenticación: **Service principal (automatic)**
5. Configuración:
   - **Subscription**: Selecciona tu suscripción de Azure
   - **Resource group**: `petfinder-rg`
   - **Service connection name**: `Azure Subscription - PetFinder`
   - ✅ Grant access permission to all pipelines
6. Click **Save**

### Paso 4: Configurar Variables del Pipeline

#### 4.1 Variables Públicas

1. **Pipelines** → Tu pipeline → **Edit**
2. **Variables** (esquina superior derecha)
3. Agregar variables:

| Nombre | Valor | Tipo |
|--------|-------|------|
| `appServiceName` | `petfinder-backend-api` | Pipeline variable |
| `nodeVersion` | `20.x` | Pipeline variable |
| `azureSubscription` | `Azure Subscription - PetFinder` | Pipeline variable |

#### 4.2 Variables Secretas

1. Crear Variable Group para secrets:
   - **Pipelines** → **Library** → **+ Variable group**
   - Name: `petfinder-secrets`
   - Agregar variables:

| Nombre | Valor | Secreto |
|--------|-------|---------|
| `JWT_SECRET` | `tu-secret-super-seguro` | ✅ Yes |
| `COSMOS_DB_KEY` | `tu-cosmos-key` | ✅ Yes |
| `STORAGE_CONNECTION_STRING` | `tu-connection-string` | ✅ Yes |

2. En el archivo `azure-pipelines.yml`, agregar al inicio:

```yaml
variables:
  - group: petfinder-secrets
```

### Paso 5: Configurar Ambientes (Environments)

#### 5.1 Crear Environment de Staging

1. **Pipelines** → **Environments** → **New environment**
2. Name: `staging`
3. Resource: None
4. **Create**

#### 5.2 Crear Environment de Production (con aprobación)

1. **Pipelines** → **Environments** → **New environment**
2. Name: `production`
3. Resource: None
4. **Create**
5. En el environment `production`:
   - Click en **⋮** (menú) → **Approvals and checks**
   - **Approvals** → **Next**
   - Agregar approvers (tu usuario o equipo)
   - **Create**

**Resultado**: Ahora cada deploy a producción requerirá aprobación manual.

---

## 🔑 Variables de Entorno

### Variables Requeridas en Azure App Service

Configurar en **Azure Portal** → **App Service** → **Configuration** → **Application settings**:

```bash
# Aplicación
NODE_ENV=production
PORT=8080
API_PREFIX=api/v1

# JWT
JWT_SECRET=tu-secret-super-seguro-aqui-cambiar-en-produccion
JWT_EXPIRATION=7d

# CORS
CORS_ORIGINS=https://tu-frontend.com,https://www.tu-frontend.com

# Azure Cosmos DB (Fase 2)
# COSMOS_ENDPOINT=https://tu-cosmos.documents.azure.com:443/
# COSMOS_KEY=tu-key-de-cosmos
# COSMOS_DATABASE=petfinder

# Azure Blob Storage (Fase 2)
# AZURE_STORAGE_CONNECTION_STRING=tu-connection-string
# AZURE_STORAGE_CONTAINER=pet-images
```

### Variables del Pipeline

Editar en `azure-pipelines.yml`:

```yaml
variables:
  # Actualizar con tus valores
  azureSubscription: 'Azure Subscription - PetFinder'
  appServiceName: 'petfinder-backend-api'  # Cambiar si usaste otro nombre
  nodeVersion: '20.x'
```

---

## ✅ Probar el Pipeline

### Ejecución Manual

1. **Pipelines** → Tu pipeline → **Run pipeline**
2. Branch: `feature/ARQ` o `develop`
3. **Run**

### Ejecución Automática (Trigger)

El pipeline se ejecutará automáticamente cuando:

- ✅ Push a `main` → Deploy a **Production** (requiere aprobación)
- ✅ Push a `develop` → Deploy a **Staging**
- ✅ Push a `feature/*` → Solo Build & Test
- ✅ Pull Request a `main` o `develop` → Validation

### Verificar Deployment

1. **Esperar a que el pipeline termine** (5-10 minutos)
2. **Verificar health check**:

```bash
# Staging
curl https://petfinder-backend-api-staging.azurewebsites.net/health

# Production
curl https://petfinder-backend-api.azurewebsites.net/health
```

3. **Ver logs en Azure**:
   - Azure Portal → App Service → **Log stream**

---

## 🐛 Solución de Problemas

### Problema 1: Pipeline falla en "Deploy to Azure App Service"

**Error**: `Service connection not found`

**Solución**:
1. Verifica que el Service Connection existe: **Project Settings** → **Service connections**
2. El nombre debe coincidir exactamente con `azureSubscription` en el pipeline
3. Asegúrate de que tiene permisos en el Resource Group

### Problema 2: Health check falla después del deployment

**Error**: `curl: (7) Failed to connect`

**Solución**:
1. Espera 1-2 minutos adicionales (warm-up time)
2. Verifica que el App Service está corriendo: Azure Portal → Overview → Status
3. Revisa logs: **Log stream**
4. Verifica variables de entorno: **Configuration** → **Application settings**

### Problema 3: Build falla en "npm ci"

**Error**: `npm ERR! code ENOLOCK`

**Solución**:
1. Asegúrate de que `package-lock.json` existe en el repo
2. Commit y push: `git add package-lock.json && git commit -m "Add package-lock.json"`

### Problema 4: Tests fallan en pipeline pero pasan localmente

**Error**: `ECONNREFUSED` o timeouts

**Solución**:
1. Aumenta timeouts en tests: `jest.config.js` → `testTimeout: 10000`
2. Desactiva tests de integración en pipeline (solo unitarios)

### Problema 5: No puedo aprobar deployment a production

**Error**: Sin permiso de approval

**Solución**:
1. **Pipelines** → **Environments** → `production` → **Approvals and checks**
2. Agrega tu usuario como approver
3. Asegúrate de que tu rol en el proyecto permite aprobar

---

## 📊 Monitoreo Post-Deployment

### Azure Application Insights (Recomendado - Fase 2)

```bash
# Crear Application Insights
az monitor app-insights component create \
  --app petfinder-insights \
  --location eastus \
  --resource-group petfinder-rg \
  --application-type Node.JS

# Conectar con App Service
az webapp config appsettings set \
  --name petfinder-backend-api \
  --resource-group petfinder-rg \
  --settings \
    APPINSIGHTS_INSTRUMENTATIONKEY="tu-instrumentation-key"
```

### Logs en Tiempo Real

```bash
# Ver logs en vivo
az webapp log tail \
  --name petfinder-backend-api \
  --resource-group petfinder-rg
```

---

## 🎯 Mejores Prácticas

### ✅ DO's

- ✅ Usar Variable Groups para secrets
- ✅ Configurar aprobaciones manuales para producción
- ✅ Habilitar branch policies en `main`:
  - Requiere PR
  - Requiere build exitoso
- ✅ Usar slots (staging/production) para zero-downtime deployments
- ✅ Configurar alertas en Azure Monitor
- ✅ Revisar logs después de cada deployment

### ❌ DON'Ts

- ❌ NO commitear secrets en el código
- ❌ NO usar el mismo App Service para staging y production
- ❌ NO deployar directamente a producción sin tests
- ❌ NO ignorar fallos en tests
- ❌ NO usar `continueOnError: true` en pasos críticos

---

## 🔗 Recursos Adicionales

### Documentación Oficial

- [Azure DevOps Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/)
- [Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/)
- [Node.js en Azure](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs)

### Tutoriales

- [Deploy Node.js to Azure App Service](https://docs.microsoft.com/en-us/azure/devops/pipelines/apps/cd/deploy-webdeploy-webapps)
- [YAML Pipeline Schema](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema)

---

## 📞 Soporte

Si tienes problemas con la configuración:

1. Revisa los logs del pipeline en Azure DevOps
2. Revisa los logs del App Service en Azure Portal
3. Consulta la documentación oficial
4. Contacta al equipo de PetFinder

---

**Última actualización**: Marzo 2026  
**Equipo**: PetFinder - UPTC
