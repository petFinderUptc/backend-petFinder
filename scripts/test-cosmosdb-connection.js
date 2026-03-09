/**
 * Script de Verificación de Conexión a Azure Cosmos DB
 * 
 * Este script verifica que:
 * 1. Las credenciales de Cosmos DB son correctas
 * 2. La conexión a Azure funciona
 * 3. La base de datos y containers existen
 * 4. Se puede leer y escribir datos
 */

require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');

// Colores para consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testCosmosDBConnection() {
  console.log('\n' + '='.repeat(60));
  log('🧪 PRUEBA DE CONEXIÓN A AZURE COSMOS DB', 'blue');
  console.log('='.repeat(60) + '\n');

  // Verificar variables de entorno
  log('📋 Verificando variables de entorno...', 'yellow');
  const endpoint = process.env.COSMOS_DB_ENDPOINT;
  const key = process.env.COSMOS_DB_KEY;
  const databaseId = process.env.COSMOS_DB_DATABASE || 'petfinder';

  if (!endpoint || !key) {
    log('❌ ERROR: Variables de entorno no configuradas', 'red');
    log('   Asegúrate de tener en tu .env:', 'red');
    log('   - COSMOS_DB_ENDPOINT', 'red');
    log('   - COSMOS_DB_KEY', 'red');
    process.exit(1);
  }

  log(`✅ Endpoint: ${endpoint}`, 'green');
  log(`✅ Key: ${key.substring(0, 10)}...${key.substring(key.length - 5)}`, 'green');
  log(`✅ Database: ${databaseId}\n`, 'green');

  try {
    // Crear cliente de Cosmos DB
    log('🔌 Conectando a Azure Cosmos DB...', 'yellow');
    const client = new CosmosClient({ endpoint, key });
    log('✅ Cliente de Cosmos DB creado exitosamente\n', 'green');

    // Verificar acceso a la cuenta
    log('🔍 Verificando acceso a la cuenta...', 'yellow');
    const { resource: account } = await client.getDatabaseAccount();
    log(`✅ Cuenta accesible: ${account.id}`, 'green');
    log(`   Región de escritura: ${account.writableLocations[0]?.name || 'N/A'}`, 'blue');
    log(`   Región de lectura: ${account.readableLocations[0]?.name || 'N/A'}\n`, 'blue');

    // Verificar/Crear database
    log(`📦 Verificando database "${databaseId}"...`, 'yellow');
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    log(`✅ Database "${databaseId}" lista\n`, 'green');

    // Verificar/Crear container "users"
    log('👥 Verificando container "users"...', 'yellow');
    const { container: usersContainer } = await database.containers.createIfNotExists({
      id: 'users',
      partitionKey: { paths: ['/id'] },
    });
    log('✅ Container "users" listo\n', 'green');

    // Verificar/Crear container "posts"
    log('📝 Verificando container "posts"...', 'yellow');
    const { container: postsContainer } = await database.containers.createIfNotExists({
      id: 'posts',
      partitionKey: { paths: ['/id'] },
    });
    log('✅ Container "posts" listo\n', 'green');

    // Probar escritura y lectura en users
    log('✍️  Probando escritura en container "users"...', 'yellow');
    const testUser = {
      id: 'test-user-' + Date.now(),
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
      isTest: true,
    };

    const { resource: createdUser } = await usersContainer.items.create(testUser);
    log(`✅ Usuario de prueba creado: ${createdUser.id}\n`, 'green');

    // Leer el usuario creado
    log('📖 Probando lectura en container "users"...', 'yellow');
    const { resource: readUser } = await usersContainer.item(testUser.id, testUser.id).read();
    log(`✅ Usuario leído correctamente: ${readUser.email}\n`, 'green');

    // Eliminar el usuario de prueba
    log('🗑️  Limpiando datos de prueba...', 'yellow');
    await usersContainer.item(testUser.id, testUser.id).delete();
    log('✅ Datos de prueba eliminados\n', 'green');

    // Resumen final
    console.log('\n' + '='.repeat(60));
    log('🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!', 'green');
    console.log('='.repeat(60));
    log('\n✅ Tu aplicación está lista para usar Azure Cosmos DB\n', 'green');
    
    log('📊 Resumen de la configuración:', 'blue');
    log(`   • Endpoint: ${endpoint}`, 'blue');
    log(`   • Database: ${databaseId}`, 'blue');
    log(`   • Containers: users, posts`, 'blue');
    log(`   • Estado: Completamente funcional\n`, 'blue');

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    log('❌ ERROR EN LA CONEXIÓN', 'red');
    console.log('='.repeat(60) + '\n');
    
    log(`Tipo de error: ${error.code || 'UNKNOWN'}`, 'red');
    log(`Mensaje: ${error.message}\n`, 'red');
    
    if (error.code === 'ENOTFOUND') {
      log('💡 Posible solución:', 'yellow');
      log('   - Verifica que el COSMOS_DB_ENDPOINT sea correcto', 'yellow');
      log('   - Verifica tu conexión a internet\n', 'yellow');
    } else if (error.code === 401 || error.code === 'Unauthorized') {
      log('💡 Posible solución:', 'yellow');
      log('   - Verifica que el COSMOS_DB_KEY sea correcto', 'yellow');
      log('   - Asegúrate de copiar la PRIMARY KEY completa desde Azure Portal\n', 'yellow');
    } else {
      log('💡 Recomendación:', 'yellow');
      log('   - Revisa los logs completos arriba', 'yellow');
      log('   - Verifica la configuración en Azure Portal\n', 'yellow');
    }

    process.exit(1);
  }
}

// Ejecutar la prueba
testCosmosDBConnection().catch(error => {
  log('\n❌ Error inesperado:', 'red');
  console.error(error);
  process.exit(1);
});
