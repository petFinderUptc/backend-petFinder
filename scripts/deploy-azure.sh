#!/bin/bash
# Script de deployment manual a Azure App Service
# Útil para deployments de emergencia o testing

set -e

echo "🚀 PetFinder Backend - Manual Deployment Script"
echo "================================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Azure CLI
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI no está instalado${NC}"
    echo "Instalar desde: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

echo -e "${GREEN}✓${NC} Azure CLI instalado"

# Configuración
RESOURCE_GROUP="petfinder-rg"
APP_NAME="petfinder-backend-api"
ENVIRONMENT=${1:-"staging"}

echo ""
echo "Configuración:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  App Name: $APP_NAME"
echo "  Environment: $ENVIRONMENT"
echo ""

# Confirmar
read -p "¿Continuar con el deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelado"
    exit 1
fi

# Login a Azure
echo ""
echo "🔐 Verificando login de Azure..."
az account show > /dev/null 2>&1 || az login

# Build
echo ""
echo "🏗️  Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Build successful"

# Tests
echo ""
echo "🧪 Running tests..."
npm run test

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Tests failed but continuing...${NC}"
fi

# Crear ZIP para deployment
echo ""
echo "📦 Creating deployment package..."
mkdir -p .deploy
rm -f .deploy/package.zip

zip -r .deploy/package.zip \
    dist \
    node_modules \
    package.json \
    package-lock.json \
    -x "node_modules/.cache/*" \
    > /dev/null

echo -e "${GREEN}✓${NC} Package created"

# Deploy
echo ""
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🚀 Deploying to PRODUCTION..."
    az webapp deployment source config-zip \
        --resource-group $RESOURCE_GROUP \
        --name $APP_NAME \
        --src .deploy/package.zip
else
    echo "🚀 Deploying to STAGING..."
    az webapp deployment source config-zip \
        --resource-group $RESOURCE_GROUP \
        --name $APP_NAME \
        --slot staging \
        --src .deploy/package.zip
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Deployment successful"

# Health check
echo ""
echo "🏥 Running health check..."
sleep 10

if [ "$ENVIRONMENT" = "production" ]; then
    URL="https://$APP_NAME.azurewebsites.net/health"
else
    URL="https://$APP_NAME-staging.azurewebsites.net/health"
fi

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓${NC} Health check passed"
    echo ""
    echo "🎉 Deployment completado exitosamente!"
    echo "🔗 URL: $URL"
else
    echo -e "${YELLOW}⚠️  Health check returned status: $HTTP_STATUS${NC}"
    echo "Revisa los logs en: https://portal.azure.com"
fi

# Cleanup
rm -rf .deploy

echo ""
echo "================================================"
echo "✅ Script completado"
