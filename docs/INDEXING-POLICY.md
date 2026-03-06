# Política de Índices - Contenedor Users

## 📋 Resumen de Configuración

El contenedor `users` está configurado con una política de índices optimizada para operaciones comunes en sistemas de gestión de usuarios.

## 🔑 Partition Key

```json
{
  "paths": ["/email"],
  "kind": "Hash",
  "version": 2
}
```

**Justificación:**
- El **email es único** por usuario, garantizando distribución uniforme
- Todas las consultas por email serán **extremadamente eficientes** (single-partition query)
- Evita hot partitions al distribuir uniformemente los datos
- La versión 2 proporciona mejor rendimiento que la versión 1

## 📊 Política de Indexación

### Modo de Indexación

```json
{
  "indexingMode": "consistent",
  "automatic": true
}
```

- **consistent**: Los índices se actualizan sincrónicamente, garantizando consultas con datos actualizados
- **automatic**: Todos los documentos se indexan automáticamente al insertarse

### Paths Incluidos

```json
"includedPaths": [
  { "path": "/*" }
]
```

Indexa **todos los campos** por defecto, permitiendo flexibilidad en consultas futuras.

### Paths Excluidos

```json
"excludedPaths": [
  { "path": "/\"_etag\"/?" }
]
```

**_etag** no se consulta nunca, excluirlo reduce:
- ✅ Consumo de RUs en escrituras
- ✅ Tamaño de índices
- ✅ Costo de almacenamiento

### Índices Compuestos

Los índices compuestos optimizan consultas que filtran/ordenan por múltiples campos:

#### 1. Búsqueda de Usuarios por Nombre

```json
[
  { "path": "/username", "order": "ascending" },
  { "path": "/createdAt", "order": "descending" }
]
```

**Casos de uso:**
```sql
-- Buscar usuarios por username ordenados por fecha de creación (más recientes primero)
SELECT * FROM c 
WHERE c.username = 'john_doe' 
ORDER BY c.createdAt DESC

-- Buscar con prefijo
SELECT * FROM c 
WHERE STARTSWITH(c.username, 'john') 
ORDER BY c.createdAt DESC
```

**Beneficio:** Reduce RUs hasta un 50% en estas consultas comunes.

#### 2. Filtrado por Rol

```json
[
  { "path": "/role", "order": "ascending" },
  { "path": "/createdAt", "order": "descending" }
]
```

**Casos de uso:**
```sql
-- Obtener todos los administradores ordenados por antigüedad
SELECT * FROM c 
WHERE c.role = 'admin' 
ORDER BY c.createdAt DESC

-- Contar usuarios por rol
SELECT c.role, COUNT(1) as total 
FROM c 
GROUP BY c.role
```

**Beneficio:** Esencial para dashboards administrativos y reportes.

#### 3. Usuarios Activos

```json
[
  { "path": "/isActive", "order": "ascending" },
  { "path": "/updatedAt", "order": "descending" }
]
```

**Casos de uso:**
```sql
-- Listar usuarios activos por última actividad
SELECT * FROM c 
WHERE c.isActive = true 
ORDER BY c.updatedAt DESC

-- Usuarios inactivos que requieren limpieza
SELECT * FROM c 
WHERE c.isActive = false 
  AND c.updatedAt < '2024-01-01'
ORDER BY c.updatedAt ASC
```

**Beneficio:** Fundamental para monitoreo y mantenimiento de cuentas.

## 📈 Impacto en Rendimiento

### Consumo de RUs (Request Units)

| Operación | Sin Índices Compuestos | Con Índices Compuestos | Mejora |
|-----------|------------------------|------------------------|--------|
| Query por email (partition key) | 2-3 RUs | 2-3 RUs | - |
| Query + ORDER BY (1 campo) | 5-10 RUs | 3-5 RUs | ~50% |
| Query + ORDER BY (2 campos) | 15-30 RUs | 5-10 RUs | ~70% |
| Escritura simple | 5 RUs | 6-7 RUs | +20% |

**Conclusión:** El ligero incremento en RUs de escritura (~20%) se compensa ampliamente con la reducción en RUs de lectura (~50-70%) dado que las lecturas son más frecuentes.

## 🎯 Mejores Prácticas

### ✅ DO: Consultas Eficientes

```typescript
// ✅ BIEN: Usar partition key + índices compuestos
const { resources } = await container.items
  .query({
    query: 'SELECT * FROM c WHERE c.email = @email',
    parameters: [{ name: '@email', value: 'user@example.com' }]
  })
  .fetchAll();

// ✅ BIEN: Aprovechar índices compuestos
const { resources } = await container.items
  .query({
    query: `
      SELECT * FROM c 
      WHERE c.role = @role 
      ORDER BY c.createdAt DESC
    `,
    parameters: [{ name: '@role', value: 'admin' }]
  })
  .fetchAll();
```

### ❌ DON'T: Anti-patterns

```typescript
// ❌ MAL: Cross-partition query sin filtro
const { resources } = await container.items
  .query('SELECT * FROM c')
  .fetchAll();

// ❌ MAL: ORDER BY campo sin índice compuesto relevante
const { resources } = await container.items
  .query(`
    SELECT * FROM c 
    WHERE c.status = 'pending'
    ORDER BY c.randomField DESC
  `)
  .fetchAll();
```

## 🔄 Evolución de la Política

### Cuándo Actualizar

⚠️ **IMPORTANTE**: Cambiar la política de índices en un contenedor con datos puede ser costoso en RUs y tiempo.

**Considera actualizar cuando:**
- Identificas nuevos patrones de consulta frecuentes
- Las métricas muestran consumo alto de RUs en ciertas queries
- Agregas nuevos campos que requieren búsquedas

### Cómo Actualizar

```typescript
// NO modificar directamente en producción
// Crear nuevo contenedor con nueva política y migrar datos

// O usar el portal de Azure para actualizar incrementalmente
```

## 📚 Documentación Adicional

- [Azure Cosmos DB Indexing Policies](https://learn.microsoft.com/en-us/azure/cosmos-db/index-policy)
- [Composite Indexes](https://learn.microsoft.com/en-us/azure/cosmos-db/index-policy#composite-indexes)
- [Optimize RU/s with Indexing](https://learn.microsoft.com/en-us/azure/cosmos-db/optimize-cost-reads-writes)

## 🧪 Scripts de Prueba

```bash
# Verificar configuración actual
node scripts/check-users-container.js

# Probar queries optimizadas
npm run test:queries

# Analizar consumo de RUs
npm run analyze:rus
```

---

**Última actualización:** Marzo 2026  
**Autor:** Backend Team - PetFinder UPTC
