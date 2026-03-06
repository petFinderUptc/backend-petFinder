# 🔧 Azure DevOps Self-Hosted Agent Setup

Si prefieres seguir usando **Azure DevOps** mientras esperas la aprobación de paralelismo, puedes usar un **Self-Hosted Agent** en tu propia máquina.

## 📋 ¿Qué es un Self-Hosted Agent?

Un agente que corre en tu propia computadora en lugar de usar los servidores de Microsoft. Es **gratis e ilimitado**, pero requiere que tu máquina esté encendida durante las ejecuciones.

---

## 🚀 Instalación Rápida (Windows)

### Paso 1: Descargar el agente

1. Ve a tu proyecto en Azure DevOps
2. Click en **Project Settings** (esquina inferior izquierda)
3. En el menú izquierdo: **Pipelines** → **Agent pools**
4. Click en **"Default"** pool
5. Click en **"New agent"** (botón azul arriba a la derecha)
6. Selecciona **Windows** y click en **"Download"**

### Paso 2: Extraer y configurar

```powershell
# 1. Crea un directorio para el agente
New-Item -Path "C:\azagent" -ItemType Directory
cd C:\azagent

# 2. Extrae el ZIP descargado aquí
# (puedes usar Windows Explorer para extraer el archivo)

# 3. Configura el agente
.\config.cmd
```

### Paso 3: Responde las preguntas de configuración

Durante `.\config.cmd` te preguntará:

```
Enter server URL > https://dev.azure.com/TU-ORGANIZACION
Enter authentication type (press enter for PAT) > [Enter]
Enter personal access token > [Pega tu token, ver abajo]
Enter agent pool (press enter for default) > Default
Enter agent name (press enter for TU-COMPUTADORA) > [Enter]
Enter work folder (press enter for _work) > [Enter]
Enter run agent as service? (Y/N) > Y
Enter User account to use for the service (press enter for NT AUTHORITY\NETWORK SERVICE) > [Enter]
```

### Paso 4: Crear Personal Access Token (PAT)

1. En Azure DevOps, click en tu avatar (arriba a la derecha)
2. **Personal access tokens**
3. **New Token**
4. Configura:
   - Name: `Self-Hosted Agent`
   - Organization: Tu organización
   - Expiration: 90 días
   - Scopes: **Agent Pools (read, manage)**
5. Click en **Create**
6. **COPIA el token inmediatamente** (no podrás verlo otra vez)

### Paso 5: Iniciar el agente

```powershell
# Iniciar manualmente (para testing)
.\run.cmd

# O instalar como servicio de Windows (recomendado)
# Ya debería estar instalado si respondiste Y en el paso 3
```

### Paso 6: Verificar que está online

1. Ve a **Project Settings** → **Agent pools** → **Default**
2. Deberías ver tu agente con un punto verde (Online)

---

## 📝 Modificar el pipeline para usar Self-Hosted Agent

Edita `azure-pipelines.yml`:

```yaml
# ANTES (Microsoft-hosted)
pool:
  vmImage: 'ubuntu-latest'

# DESPUÉS (Self-hosted en Windows)
pool:
  name: 'Default'
  demands:
    - agent.os -equals Windows_NT
```

### Pipeline completo modificado:

```yaml
trigger:
  branches:
    include:
      - develop
      - main
      - feature/*

pool:
  name: 'Default'  # Self-hosted agent pool
  demands:
    - agent.os -equals Windows_NT

variables:
  nodeVersion: '20.x'
  artifactName: 'petfinder-backend'

stages:
  - stage: BuildAndTest
    displayName: 'Build and Test'
    jobs:
      - job: Build
        displayName: 'Build Application'
        steps:
          # Node.js ya debe estar instalado en tu máquina
          - task: NodeTool@0
            displayName: 'Use Node.js $(nodeVersion)'
            inputs:
              versionSpec: '$(nodeVersion)'

          - script: npm ci
            displayName: 'Install Dependencies'

          - script: npm test
            displayName: 'Run Tests'

          - script: npm run build
            displayName: 'Build Application'

          - task: PublishBuildArtifacts@1
            displayName: 'Publish Artifacts'
            inputs:
              PathtoPublish: 'dist'
              ArtifactName: '$(artifactName)'
```

---

## ⚙️ Requisitos en tu máquina

### Software necesario

- ✅ **Node.js 20.x** (ya lo debes tener instalado)
- ✅ **Git** (ya lo debes tener instalado)
- ✅ **.NET Framework 4.6.2+** (viene con Windows 10/11)

### Verificar requisitos:

```powershell
# Verificar Node.js
node --version  # Debe mostrar v20.x.x

# Verificar Git
git --version

# Verificar .NET Framework
Get-ChildItem 'HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full'
```

---

## 🛠️ Comandos útiles del agente

### Ver estado del servicio

```powershell
# Ver estado
Get-Service vstsagent*

# Iniciar servicio
Start-Service vstsagent*

# Detener servicio
Stop-Service vstsagent*
```

### Reconfigurar el agente

```powershell
cd C:\azagent
.\config.cmd remove  # Remover configuración actual
.\config.cmd         # Configurar nuevamente
```

### Actualizar el agente

```powershell
cd C:\azagent
.\config.cmd remove
# Descargar nueva versión desde Azure DevOps
# Extraer en el mismo directorio
.\config.cmd
```

---

## 🔍 Troubleshooting

### El agente aparece Offline

1. Verifica que el servicio esté corriendo:
   ```powershell
   Get-Service vstsagent*
   ```

2. Si está detenido, inícialo:
   ```powershell
   Start-Service vstsagent*
   ```

3. Revisa los logs:
   ```powershell
   Get-Content C:\azagent\_diag\*.log -Tail 50
   ```

### Error: "PAT expired"

- Tu Personal Access Token expiró
- Crea uno nuevo en Azure DevOps
- Reconfigura el agente: `.\config.cmd remove` y `.\config.cmd`

### Pipeline sigue fallando con "No parallelism"

- Verifica que modificaste el `pool:` en `azure-pipelines.yml`
- Debe decir `name: 'Default'` en lugar de `vmImage`

### Error: "Node not found"

```powershell
# Instala Node.js 20.x globalmente
# Descarga desde: https://nodejs.org/

# Verifica que esté en el PATH
$env:PATH
```

### El build falla con permisos

```powershell
# Ejecuta como administrador
.\config.cmd
# Y selecciona una cuenta con permisos adecuados
```

---

## ⚠️ Limitaciones

- ❌ Tu computadora debe estar **encendida** durante las ejecuciones
- ❌ **Más lento** que Microsoft-hosted agents (depende de tu hardware)
- ❌ Necesitas **mantener actualizado** Node.js y dependencias
- ❌ Solo un pipeline puede ejecutarse a la vez (a menos que instales múltiples agentes)

---

## 🆚 Comparación de Opciones

| Opción | Costo | Tiempo Setup | Requiere PC encendida |
|--------|-------|--------------|----------------------|
| **GitHub Actions** | Gratis | 5 minutos | ❌ No |
| **Azure Pipelines (hosted)** | Requiere aprobación | 2-3 días | ❌ No |
| **Self-Hosted Agent** | Gratis | 15 minutos | ✅ Sí |

**Recomendación**: 
1. 🥇 **GitHub Actions** (más sencillo)
2. 🥈 **Self-Hosted Agent** (mientras esperas aprobación)
3. 🥉 **Solicitar paralelismo** (mejor solución a largo plazo)

---

## 📚 Recursos

- [Azure Pipelines Agents Documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/agents)
- [Self-hosted Windows agents](https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/v2-windows)
- [Agent Pools](https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/pools-queues)

---

## ✅ Checklist

- [ ] Agente descargado de Azure DevOps
- [ ] Configurado con PAT (Personal Access Token)
- [ ] Servicio de Windows instalado y corriendo
- [ ] Agente aparece "Online" en Azure DevOps
- [ ] `azure-pipelines.yml` modificado para usar pool "Default"
- [ ] Node.js 20.x instalado en tu máquina
- [ ] Primera ejecución del pipeline exitosa
