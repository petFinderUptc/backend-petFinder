/**
 * Script para verificar el contenedor de usuarios
 * Verifica si hay datos y muestra la configuración actual
 */

require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE || 'petfinder';

async function checkUsersContainer() {
  console.log('🔍 Verificando contenedor de usuarios...\n');

  try {
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    const container = database.container('users');

    // Obtener información del contenedor
    const { resource: containerInfo } = await container.read();

    console.log('📋 Configuración actual del contenedor:');
    console.log('   ID:', containerInfo.id);
    console.log('   Partition Key:', JSON.stringify(containerInfo.partitionKey, null, 2));
    console.log('   Indexing Policy:', JSON.stringify(containerInfo.indexingPolicy, null, 2));
    console.log();

    // Contar documentos
    const { resources: items } = await container.items
      .query('SELECT VALUE COUNT(1) FROM c')
      .fetchAll();

    const count = items[0] || 0;
    console.log(`📊 Total de documentos: ${count}`);

    if (count > 0) {
      console.log('\n⚠️  El contenedor tiene datos. Se requiere migración.');

      // Mostrar algunos documentos de ejemplo
      const { resources: samples } = await container.items
        .query('SELECT TOP 3 * FROM c')
        .fetchAll();

      console.log('\n📄 Documentos de ejemplo:');
      samples.forEach((doc, i) => {
        console.log(`   ${i + 1}.`, JSON.stringify(doc, null, 2));
      });
    } else {
      console.log('✅ El contenedor está vacío. Seguro para eliminar y recrear.');
    }
  } catch (error) {
    if (error.code === 404) {
      console.log('❌ El contenedor "users" no existe aún.');
    } else {
      console.error('Error:', error.message);
    }
  }
}

checkUsersContainer().catch(console.error);
