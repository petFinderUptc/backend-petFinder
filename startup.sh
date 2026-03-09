#!/bin/bash
# Startup script for Azure App Service (Linux)

echo "🚀 Starting PetFinder Backend..."

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found. Running build..."
    npm run build
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci --production
fi

# Display environment info
echo "✅ Environment: $NODE_ENV"
echo "✅ Port: $PORT"
echo "✅ Starting application..."

# Start the application
npm run start:prod
