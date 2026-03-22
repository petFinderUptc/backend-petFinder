/**
 * Script para limpiar usuarios de prueba
 */

require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE || 'petfinder';

async function cleanupTestUsers() {
  console.log('🧹 Limpiando usuarios de prueba...\n');

  try {
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    const container = database.container('users');

    // Obtener todos los usuarios
    const { resources: users } = await container.items.query('SELECT * FROM c').fetchAll();

    if (users.length === 0) {
      console.log('✅ No hay usuarios para limpiar');
      return;
    }

    console.log(`📊 Encontrados ${users.length} usuario(s)\n`);

    // Eliminar cada usuario
    for (const user of users) {
      console.log(`🗑️  Eliminando: ${user.email} (${user.username})`);
      await container.item(user.id, user.email).delete();
      console.log('   ✅ Eliminado');
    }

    console.log(`\n✅ Se eliminaron ${users.length} usuario(s) exitosamente`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

cleanupTestUsers().catch(console.error);
