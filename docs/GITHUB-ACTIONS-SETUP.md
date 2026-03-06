# 🚀 GitHub Actions CI/CD Setup - PetFinder Backend

Esta guía te ayudará a configurar el pipeline de CI/CD usando **GitHub Actions** como alternativa a Azure DevOps (que requiere paralelismo).

## 📋 Ventajas de GitHub Actions

- ✅ **Gratis** para repositorios públicos (2,000 minutos/mes para privados)
- ✅ **No requiere aprobación** de paralelismo
- ✅ **Más rápido de configurar** que Azure DevOps
- ✅ **Integración nativa** con GitHub
- ✅ **Environments** con protección y aprobaciones

---

## 🔧 Configuración Inicial

### Paso 1: El archivo ya está creado

El workflow está en `.github/workflows/ci-cd.yml` y se ejecuta automáticamente en:
- Push a `develop`, `main`, o ramas `feature/**`
- Pull Requests hacia `develop` o `main`

### Paso 2: Commit y Push del workflow

```bash
git add .github/workflows/ci-cd.yml
git commit -m "feat: agregar GitHub Actions workflow para CI/CD"
git push
```

### Paso 3: Ver la primera ejecución

1. Ve a tu repositorio en GitHub: https://github.com/petFinderUptc/backend-petFinder
2. Click en la pestaña **"Actions"**
3. Verás el workflow ejecutándose automáticamente

---

## 🔐 Configurar Secrets (para deployment a Azure)

Para que los deployments funcionen, necesitas configurar estos secrets en GitHub:

### 1. Ir a Settings → Secrets → Actions

En tu repositorio: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### 2. Crear los siguientes secrets:

| Secret Name | Descripción | Cómo obtenerlo |
|------------|-------------|----------------|
| `AZURE_APP_SERVICE_NAME` | Nombre del App Service | Ej: `petfinder-backend-api` |
| `AZURE_PUBLISH_PROFILE_STAGING` | Perfil de publicación del slot staging | Ver instrucciones abajo |
| `AZURE_PUBLISH_PROFILE_PRODUCTION` | Perfil de publicación de producción | Ver instrucciones abajo |

### 3. Obtener el Publish Profile de Azure

#### Opción A: Desde Azure Portal

1. Ve a tu App Service en Azure Portal
2. En el menú izquierdo, click en **"Deployment Center"**
3. Click en **"Manage publish profile"** → **"Download publish profile"**
4. Abre el archivo `.PublishSettings` descargado
5. Copia **TODO el contenido XML**
6. Pégalo como valor del secret en GitHub

#### Opción B: Usando Azure CLI

```bash
# Para producción
az webapp deployment list-publishing-profiles \
  --name petfinder-backend-api \
  --resource-group petfinder-rg \
  --xml

# Para staging slot
az webapp deployment list-publishing-profiles \
  --name petfinder-backend-api \
  --resource-group petfinder-rg \
  --slot staging \
  --xml
```

---

## 🌍 Configurar Environments (Opcional pero recomendado)

Los environments permiten agregar aprobaciones manuales y protección.

### 1. Crear Environments en GitHub

1. Ve a tu repo → **Settings** → **Environments**
2. Click en **"New environment"**
3. Crea dos environments:
   - `staging`
   - `production`

### 2. Agregar protección al environment de Production

1. Click en `production` environment
2. Habilita **"Required reviewers"**
3. Agrega tu usuario como reviewer
4. Ahora cada deploy a producción requerirá tu aprobación manual

---

## 🎯 Flujo de Trabajo

### Para Development (feature branches)

```bash
# Trabajas en tu feature branch
git checkout -b feature/nueva-funcionalidad

# Haces commits
git add .
git commit -m "feat: nueva funcionalidad"
git push

# GitHub Actions ejecutará: Build & Test ✅
```

### Para Staging (branch develop)

```bash
# Merge tu feature a develop
git checkout develop
git merge feature/nueva-funcionalidad
git push

# GitHub Actions ejecutará:
# 1. Build & Test ✅
# 2. Deploy to Staging ✅
```

### Para Production (branch main)

```bash
# Merge develop a main
git checkout main
git merge develop
git push

# GitHub Actions ejecutará:
# 1. Build & Test ✅
# 2. Deploy to Production ✅ (con aprobación si configuraste environment)
# 3. Smoke Tests ✅
```

---

## 📊 Monitoreo y Logs

### Ver ejecuciones del pipeline

1. GitHub → **Actions** tab
2. Click en cualquier workflow run
3. Verás todos los jobs y sus logs en tiempo real

### Ver cobertura de código

- El workflow sube automáticamente la cobertura a [Codecov](https://codecov.io)
- Conecta tu repo a Codecov para ver reportes detallados

---

## 🔧 Personalización

### Ejecutar solo Build & Test (sin deployments)

El workflow ya está configurado para:
- **Feature branches**: Solo Build & Test
- **Branch develop**: Build & Test + Deploy Staging
- **Branch main**: Build & Test + Deploy Production + Smoke Tests

### Deshabilitar deployments temporalmente

Comenta las secciones de deployment en `.github/workflows/ci-cd.yml`:

```yaml
# deploy-staging:
#   name: Deploy to Staging
#   ...

# deploy-production:
#   name: Deploy to Production
#   ...
```

---

## ❓ Troubleshooting

### Error: "Resource not found"

- Verifica que el `AZURE_APP_SERVICE_NAME` sea correcto
- Asegúrate de que el App Service existe en Azure

### Error: "Publish profile is invalid"

- Vuelve a descargar el publish profile desde Azure Portal
- Asegúrate de copiar **TODO el contenido XML** del archivo `.PublishSettings`
- No edites el XML manualmente

### Error: "Tests failed"

- Revisa el log del job "Build and Test"
- Ejecuta los tests localmente: `npm test`
- Corrige los tests que fallen

### El workflow no se ejecuta

- Verifica que el archivo esté en `.github/workflows/ci-cd.yml`
- Verifica que el branch esté en `develop`, `main`, o `feature/**`
- Revisa la pestaña **Actions** → puede estar deshabilitada

---

## 🆚 Comparación: GitHub Actions vs Azure Pipelines

| Característica | GitHub Actions | Azure Pipelines |
|---------------|----------------|-----------------|
| **Costo** | Gratis (2,000 min/mes) | Requiere paralelismo |
| **Setup** | Inmediato | Requiere aprobación (2-3 días) |
| **Integración GitHub** | Nativa | Requiere webhook |
| **Environments** | Built-in | Requiere permisos especiales |
| **Logs** | Interfaz moderna | Similar |
| **Artifacts** | 90 días retention | 30 días default |

**Recomendación**: Usa **GitHub Actions** para este proyecto.

---

## 📚 Recursos

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure Web App Deploy Action](https://github.com/Azure/webapps-deploy)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## ✅ Checklist de Configuración

- [ ] `.github/workflows/ci-cd.yml` creado y pusheado
- [ ] Secret `AZURE_APP_SERVICE_NAME` configurado
- [ ] Secret `AZURE_PUBLISH_PROFILE_STAGING` configurado (opcional)
- [ ] Secret `AZURE_PUBLISH_PROFILE_PRODUCTION` configurado (opcional)
- [ ] Environment `staging` creado en GitHub (opcional)
- [ ] Environment `production` creado con required reviewers (opcional)
- [ ] Primera ejecución del workflow exitosa
- [ ] Tests pasando correctamente

---

**¿Necesitas ayuda?** Revisa la sección de Troubleshooting o consulta los logs en la pestaña Actions de GitHub.
