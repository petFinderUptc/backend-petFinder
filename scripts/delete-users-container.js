/**
 * Script para eliminar el contenedor users existente
 * ADVERTENCIA: Esto eliminará todos los datos del contenedor
 */

require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE || 'petfinder';

async function deleteUsersContainer() {
  console.log('🗑️  Eliminando contenedor "users"...\n');

  try {
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    const container = database.container('users');

    // Verificar que existe antes de eliminar
    try {
      await container.read();
      console.log('✓ Contenedor encontrado');
    } catch (error) {
      if (error.code === 404) {
        console.log('❌ El contenedor "users" no existe.');
        return;
      }
      throw error;
    }

    // Eliminar el contenedor
    await container.delete();
    console.log('✅ Contenedor "users" eliminado exitosamente');
    console.log('\nAhora puedes reiniciar la aplicación para crear el contenedor con la nueva configuración.');

  } catch (error) {
    console.error('❌ Error al eliminar el contenedor:', error.message);
    throw error;
  }
}

deleteUsersContainer().catch(console.error);
