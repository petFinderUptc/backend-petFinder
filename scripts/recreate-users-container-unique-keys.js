/**
 * Script para eliminar y recrear el contenedor users con unique keys
 * ADVERTENCIA: Esto eliminará todos los datos del contenedor
 */

require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE || 'petfinder';

async function recreateUsersContainerWithUniqueKeys() {
  console.log('🔄 Recreando contenedor "users" con unique keys...\n');

  try {
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);

    // 1. Eliminar contenedor existente
    console.log('🗑️  Paso 1: Eliminando contenedor existente...');
    try {
      const container = database.container('users');
      await container.read();
      await container.delete();
      console.log('   ✅ Contenedor eliminado');
    } catch (error) {
      if (error.code === 404) {
        console.log('   ℹ️  Contenedor no existe (continuar)');
      } else {
        throw error;
      }
    }

    // 2. Crear contenedor con nueva configuración
    console.log('\n🏗️  Paso 2: Creando contenedor con unique keys...');
    const { container: newContainer } = await database.containers.create({
      id: 'users',
      partitionKey: {
        paths: ['/email'],
        version: 2,
      },
      uniqueKeyPolicy: {
        uniqueKeys: [
          {
            paths: ['/username'],
          },
          {
            paths: ['/email'],
          },
        ],
      },
      indexingPolicy: {
        indexingMode: 'consistent',
        automatic: true,
        includedPaths: [
          {
            path: '/*',
          },
        ],
        excludedPaths: [
          {
            path: '/"_etag"/?',
          },
        ],
        compositeIndexes: [
          [
            { path: '/username', order: 'ascending' },
            { path: '/createdAt', order: 'descending' },
          ],
          [
            { path: '/role', order: 'ascending' },
            { path: '/createdAt', order: 'descending' },
          ],
          [
            { path: '/isActive', order: 'ascending' },
            { path: '/updatedAt', order: 'descending' },
          ],
        ],
      },
    });

    console.log('   ✅ Contenedor creado con unique keys');

    // 3. Verificar configuración
    console.log('\n🔍 Paso 3: Verificando configuración...');
    const { resource: containerInfo } = await newContainer.read();

    console.log('\n📋 Configuración aplicada:');
    console.log('   Partition Key:', JSON.stringify(containerInfo.partitionKey));
    console.log('   Unique Keys:', JSON.stringify(containerInfo.uniqueKeyPolicy, null, 2));
    console.log('   Indexing Mode:', containerInfo.indexingPolicy.indexingMode);
    console.log('   Composite Indexes:', containerInfo.indexingPolicy.compositeIndexes.length);

    console.log('\n✅ Contenedor recreado exitosamente con unique keys');
    console.log('\n📝 Restricciones de unicidad activas:');
    console.log('   • /email - Unique (partition key + unique constraint)');
    console.log('   • /username - Unique (global en toda la database)');
    console.log(
      '\n💡 Intentos de crear documentos con email o username duplicados fallarán con error 409.',
    );
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

recreateUsersContainerWithUniqueKeys().catch(console.error);
