# Script de prueba para verificar Cosmos DB
# Ejecutar después de iniciar el servidor con: npm run start:dev

Write-Host "🧪 Prueba de Cosmos DB - PetFinder Backend" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# 1. Verificar que el servidor esté corriendo
Write-Host "1️⃣  Verificando servidor..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
    Write-Host "✅ Servidor corriendo correctamente" -ForegroundColor Green
    Write-Host "   Estado: $($health.status)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: Servidor no disponible en http://localhost:3000" -ForegroundColor Red
    Write-Host "   Por favor ejecuta: npm run start:dev`n" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar conexión a Cosmos DB
Write-Host "2️⃣  Verificando conexión a Cosmos DB..." -ForegroundColor Yellow
try {
    $dbHealth = Invoke-RestMethod -Uri "http://localhost:3000/db-health" -Method GET
    Write-Host "✅ Conexión a Cosmos DB exitosa" -ForegroundColor Green
    Write-Host "   $($dbHealth | ConvertTo-Json)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: No se pudo conectar a Cosmos DB" -ForegroundColor Red
    Write-Host "   Verifica las variables de entorno en .env`n" -ForegroundColor Yellow
    exit 1
}

# 3. Crear usuario de prueba
Write-Host "3️⃣  Creando usuario de prueba..." -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$testUser = @{
    email = "test_$timestamp@petfinder.com"
    username = "testuser_$timestamp"
    password = "TestPassword123!"
    firstName = "Usuario"
    lastName = "Prueba"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" `
                                   -Method POST `
                                   -Body $testUser `
                                   -ContentType "application/json"
    
    Write-Host "✅ Usuario creado exitosamente en Cosmos DB" -ForegroundColor Green
    Write-Host "`n📋 Detalles del usuario:" -ForegroundColor Cyan
    Write-Host "   ID: $($response.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host "   Username: $($response.user.username)" -ForegroundColor Gray
    Write-Host "   Nombre: $($response.user.firstName) $($response.user.lastName)" -ForegroundColor Gray
    Write-Host "   Rol: $($response.user.role)" -ForegroundColor Gray
    Write-Host "   Activo: $($response.user.isActive)" -ForegroundColor Gray
    Write-Host "`n🔑 Token JWT generado:" -ForegroundColor Cyan
    Write-Host "   $($response.access_token.Substring(0, 50))..." -ForegroundColor Gray
    
    Write-Host "`n✅ PRUEBA EXITOSA: Cosmos DB está guardando datos correctamente`n" -ForegroundColor Green
    
    # Guardar datos para verificación
    $verificationData = @{
        userId = $response.user.id
        email = $response.user.email
        username = $response.user.username
        timestamp = $timestamp
    }
    $verificationData | ConvertTo-Json | Out-File "test-cosmos-verification.json"
    Write-Host "📄 Datos guardados en: test-cosmos-verification.json" -ForegroundColor Gray
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    
    if ($statusCode -eq 409) {
        Write-Host "⚠️  Usuario ya existe en la base de datos" -ForegroundColor Yellow
        Write-Host "   Esto confirma que Cosmos DB está funcionando" -ForegroundColor Gray
    } else {
        Write-Host "❌ Error al crear usuario:" -ForegroundColor Red
        Write-Host "   Código: $statusCode" -ForegroundColor Red
        Write-Host "   Detalle: $errorBody`n" -ForegroundColor Red
    }
}

# 4. Verificar en Azure Portal
Write-Host "`n4️⃣  Verificación en Azure Portal:" -ForegroundColor Yellow
Write-Host "   🌐 https://portal.azure.com" -ForegroundColor Cyan
Write-Host "   📦 Cosmos DB: petfinder-cosmosdb" -ForegroundColor Gray
Write-Host "   🗄️  Database: petfinder" -ForegroundColor Gray
Write-Host "   📁 Container: users" -ForegroundColor Gray
Write-Host "`n   Ve a: Data Explorer → petfinder → users → Items" -ForegroundColor Yellow
Write-Host "   Deberías ver el usuario creado con el timestamp: $timestamp`n" -ForegroundColor Gray

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Prueba completada" -ForegroundColor Cyan
