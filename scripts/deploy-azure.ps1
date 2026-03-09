# PowerShell Script de Deployment Manual a Azure
# Útil para deployments de emergencia o testing desde Windows

[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet('staging', 'production')]
    [string]$Environment = 'staging'
)

Write-Host "🚀 PetFinder Backend - Manual Deployment Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$ResourceGroup = "petfinder-rg"
$AppName = "petfinder-backend-api"

Write-Host "Configuración:"
Write-Host "  Resource Group: $ResourceGroup"
Write-Host "  App Name: $AppName"
Write-Host "  Environment: $Environment"
Write-Host ""

# Verificar Azure CLI
try {
    az --version | Out-Null
    Write-Host "✓ Azure CLI instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI no está instalado" -ForegroundColor Red
    Write-Host "Instalar desde: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
}

# Confirmar
$confirm = Read-Host "¿Continuar con el deployment? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Deployment cancelado" -ForegroundColor Yellow
    exit 0
}

# Login a Azure
Write-Host ""
Write-Host "🔐 Verificando login de Azure..." -ForegroundColor Cyan
try {
    az account show 2>$null | Out-Null
} catch {
    az login
}

# Build
Write-Host ""
Write-Host "🏗️  Building application..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build successful" -ForegroundColor Green

# Tests
Write-Host ""
Write-Host "🧪 Running tests..." -ForegroundColor Cyan
npm run test

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Tests failed but continuing..." -ForegroundColor Yellow
}

# Crear ZIP para deployment
Write-Host ""
Write-Host "📦 Creating deployment package..." -ForegroundColor Cyan

if (Test-Path ".\.deploy") {
    Remove-Item ".\.deploy" -Recurse -Force
}
New-Item -ItemType Directory -Path ".\.deploy" -Force | Out-Null

# Crear archivo ZIP
Compress-Archive -Path "dist", "node_modules", "package.json", "package-lock.json" `
    -DestinationPath ".\.deploy\package.zip" -Force

Write-Host "✓ Package created" -ForegroundColor Green

# Deploy
Write-Host ""
if ($Environment -eq 'production') {
    Write-Host "🚀 Deploying to PRODUCTION..." -ForegroundColor Cyan
    az webapp deployment source config-zip `
        --resource-group $ResourceGroup `
        --name $AppName `
        --src ".\.deploy\package.zip"
} else {
    Write-Host "🚀 Deploying to STAGING..." -ForegroundColor Cyan
    az webapp deployment source config-zip `
        --resource-group $ResourceGroup `
        --name $AppName `
        --slot staging `
        --src ".\.deploy\package.zip"
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Deployment successful" -ForegroundColor Green

# Health check
Write-Host ""
Write-Host "🏥 Running health check..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

if ($Environment -eq 'production') {
    $Url = "https://$AppName.azurewebsites.net/health"
} else {
    $Url = "https://$AppName-staging.azurewebsites.net/health"
}

try {
    $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Health check passed" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Deployment completado exitosamente!" -ForegroundColor Green
        Write-Host "🔗 URL: $Url" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Health check failed: $_" -ForegroundColor Yellow
    Write-Host "Revisa los logs en: https://portal.azure.com" -ForegroundColor Yellow
}

# Cleanup
Remove-Item ".\.deploy" -Recurse -Force

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Script completado" -ForegroundColor Green
