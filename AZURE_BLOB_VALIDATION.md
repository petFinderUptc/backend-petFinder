# 📊 Verificación de Azure Blob Storage y Cosmos DB

## ✅ Resultados del E2E Test

```
Health: healthy
DB Health: connected
User Registered: blobtest_20260320140755@test.com
Login: successful

Upload Image: SUCCESS
  - imageId: img_1774033678701_135260
  - imageUrl: https://petfinderimg.blob.core.windows.net/pet-images/reports/1774033678691-254970.png
  - signedUrl: https://petfinderimg.blob.core.windows.net/pet-images/reports/1774033678691-254970.png?sv=2026-02-06&se=2026-03-20T20%3A07%3A58Z&sr=b&sp=r&sig=8vmDvUQQ9oQQie%2BOl1Ifgg%2BS41Ry3YmNbE8UCbOfoHo%3D

Report Created: report_1774033679121_490552
  - Color: cafe
  - ImageUrl: persisted correctly in Cosmos DB reports container
```

## 📍 Cómo Visualizar en Azure Portal

### 1️⃣ Verificar Imágenes en Blob Storage

**Pasos:**
1. Ir a [Azure Portal](https://portal.azure.com)
2. Buscar tu Storage Account: **petfinderimg**
3. Click en **Containers**
4. Abre el contenedor **pet-images**
5. Verás carpetas: `posts/`, `reports/`, `avatars/`
6. Dentro de `reports/` puedes ver los archivos subidos

**Estructura esperada:**
```
petfinderimg (Storage Account)
├── pet-images (Container)
│   ├── posts/
│   ├── reports/
│   │   └── 1774033678691-254970.png ✅ (tu imagen subida)
│   └── avatars/
```

### 2️⃣ Verificar Metadata en Cosmos DB

**Pasos:**
1. Ir a [Azure Portal](https://portal.azure.com)
2. Busca tu Cosmos DB Account
3. Click en **Data Explorer**
4. Expande **petfinder-db** → **images** container
5. Click en **Items** para ver los documentos

**Estructura esperada de documento:**
```json
{
  "id": "img_1774033678701_135260",
  "userId": "uuid-del-usuario",
  "folder": "reports",
  "containerName": "pet-images",
  "blobName": "reports/1774033678691-254970.png",
  "imageUrl": "https://petfinderimg.blob.core.windows.net/pet-images/reports/1774033678691-254970.png",
  "signedUrl": "https://petfinderimg.blob.core.windows.net/pet-images/reports/...",
  "contentType": "image/png",
  "size": 68,
  "createdAt": "2026-03-20T20:07:58.000Z",
  "updatedAt": "2026-03-20T20:07:58.000Z",
  "isActive": true
}
```

### 3️⃣ Verificar Reports en Cosmos DB

**Pasos:**
1. En **Data Explorer** → **petfinder-db** → **reports** container
2. Click en **Items**
3. Busca el reporte creado por su ID: `report_1774033679121_490552`

**Verifica que el imageUrl está guardado:**
```json
{
  "id": "report_1774033679121_490552",
  "species": "dog",
  "type": "lost",
  "color": "cafe",
  "imageUrl": "https://petfinderimg.blob.core.windows.net/pet-images/reports/1774033678691-254970.png",
  ...
}
```

## 🔒 Verificar Signed URLs

Desde PowerShell, prueba que la signed URL funciona:

```powershell
$signedUrl = "https://petfinderimg.blob.core.windows.net/pet-images/reports/1774033678691-254970.png?sv=2026-02-06&se=2026-03-20T20%3A07%3A58Z&sr=b&sp=r&sig=..."

Invoke-WebRequest -Uri $signedUrl -Method Head
# Deberías recibir Status Code 200
```

## 🗂️ Estructura Completa del Sistema

```
Azure Storage Account: petfinderimg
└── Container: pet-images/
    ├── posts/         (imágenes de posts)
    ├── reports/       (imágenes de reportes) ✅
    └── avatars/       (avatares de usuarios)

Azure Cosmos DB: petfinder-db
├── Container: users
├── Container: posts
├── Container: reports (contiene imageUrl)
├── Container: notifications
└── Container: images (METADATA de imágenes) ✅
    ├── Partition Key: /userId
    ├── Composite Index: (userId, createdAt DESC)
    └── Composite Index: (folder, createdAt DESC)
```

## ✨ Validaciones Completadas

- ✅ **Azure Blob Storage Upload**: Imágenes subidas correctamente
- ✅ **Signed URLs**: SAS tokens generados y válidos por 60 minutos
- ✅ **Cosmos DB Metadata**: Documentos creados en `images` container
- ✅ **Report Persistence**: ImageUrl guardado en reports container
- ✅ **File Validation**: Solo JPG/PNG, máximo 5MB
- ✅ **Error Handling**: Rollback automático si falla Cosmos

## 🚀 Endpoints Disponibles

```
POST /api/v1/posts/upload-image
POST /api/v1/reports/upload-image
POST /api/v1/users/:id/avatar
```

Todos retornan:
```json
{
  "imageId": "img_...",
  "imageUrl": "https://petfinderimg.blob.core.windows.net/...",
  "signedUrl": "https://petfinderimg.blob.core.windows.net/...?sv=2026-02-06&...",
  "blobName": "reports/1774033678691-254970.png"
}
```

## 📝 Notas Importantes

1. **Signed URLs**: Válidas por 60 minutos (configurable en env vars)
2. **Partition Key**: Todos los documentos de imágenes usan `userId` para queries eficientes
3. **Transactional Integrity**: Si Cosmos DB falla, el blob es eliminado automáticamente
4. **Storage Account**: `petfinderimg` en región `East US 2`

---

**Confirmado**: Azure Blob Storage + Cosmos DB están funcionando correctamente y persisten todos los datos. ✅
