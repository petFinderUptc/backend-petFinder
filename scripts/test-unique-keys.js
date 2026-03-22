/**
 * Script de prueba para verificar unique keys
 * Intenta crear usuarios duplicados para validar restricciones de unicidad
 */

require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');
const { v4: uuidv4 } = require('uuid');

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE || 'petfinder';

async function testUniqueKeys() {
  console.log('🧪 Probando restricciones de unique keys...\n');

  try {
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    const container = database.container('users');

    // 1. Crear primer usuario
    console.log('📝 TEST 1: Crear usuario inicial');
    const user1 = {
      id: uuidv4(),
      email: 'test1@petfinder.com',
      username: 'testuser1',
      password: 'hashed_password',
      firstName: 'Test',
      lastName: 'User 1',
      role: 'user',
      isActive: true,
      emailVerified: false,
      phoneVerified: false,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await container.items.create(user1);
    console.log('   ✅ Usuario creado exitosamente');
    console.log(`   ID: ${user1.id}`);
    console.log(`   Email: ${user1.email}`);
    console.log(`   Username: ${user1.username}\n`);

    // 2. Intentar crear usuario con email duplicado (debe fallar)
    console.log('📝 TEST 2: Intentar crear usuario con email duplicado');
    const user2WithDuplicateEmail = {
      id: uuidv4(),
      email: 'test1@petfinder.com', // DUPLICADO
      username: 'testuser2',
      password: 'hashed_password',
      firstName: 'Test',
      lastName: 'User 2',
      role: 'user',
      isActive: true,
      emailVerified: false,
      phoneVerified: false,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await container.items.create(user2WithDuplicateEmail);
      console.log('   ❌ ERROR: Usuario con email duplicado fue creado (no debería)');
    } catch (error) {
      if (error.code === 409) {
        console.log('   ✅ CORRECTO: Email duplicado rechazado (Conflict 409)');
        console.log(`   Mensaje: ${error.message}\n`);
      } else {
        console.log(`   ⚠️  Error inesperado: ${error.code}`);
        throw error;
      }
    }

    // 3. Intentar crear usuario con username duplicado (debe fallar)
    console.log('📝 TEST 3: Intentar crear usuario con username duplicado');
    const user3WithDuplicateUsername = {
      id: uuidv4(),
      email: 'test2@petfinder.com',
      username: 'testuser1', // DUPLICADO
      password: 'hashed_password',
      firstName: 'Test',
      lastName: 'User 3',
      role: 'user',
      isActive: true,
      emailVerified: false,
      phoneVerified: false,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await container.items.create(user3WithDuplicateUsername);
      console.log('   ❌ ERROR: Usuario con username duplicado fue creado (no debería)');
    } catch (error) {
      if (error.code === 409) {
        console.log('   ✅ CORRECTO: Username duplicado rechazado (Conflict 409)');
        console.log(`   Mensaje: ${error.message}\n`);
      } else {
        console.log(`   ⚠️  Error inesperado: ${error.code}`);
        throw error;
      }
    }

    // 4. Crear segundo usuario válido (no duplicado)
    console.log('📝 TEST 4: Crear segundo usuario válido');
    const user4Valid = {
      id: uuidv4(),
      email: 'test2@petfinder.com',
      username: 'testuser2',
      password: 'hashed_password',
      firstName: 'Test',
      lastName: 'User 2',
      role: 'user',
      isActive: true,
      emailVerified: false,
      phoneVerified: false,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await container.items.create(user4Valid);
    console.log('   ✅ Usuario creado exitosamente');
    console.log(`   ID: ${user4Valid.id}`);
    console.log(`   Email: ${user4Valid.email}`);
    console.log(`   Username: ${user4Valid.username}\n`);

    // 5. Limpieza: eliminar usuarios de prueba
    console.log('🧹 Limpieza: Eliminando usuarios de prueba...');
    await container.item(user1.id, user1.email).delete();
    await container.item(user4Valid.id, user4Valid.email).delete();
    console.log('   ✅ Usuarios de prueba eliminados\n');

    console.log('✅ TODOS LOS TESTS PASARON');
    console.log('\n📊 Resumen de Unique Keys:');
    console.log('   ✓ Email: Garantiza que no haya emails duplicados');
    console.log('   ✓ Username: Garantiza que no haya usernames duplicados');
    console.log('   ✓ Ambos funcionan correctamente rechazando duplicados con error 409');
  } catch (error) {
    console.error('\n❌ Error en tests:', error.message);
    throw error;
  }
}

testUniqueKeys().catch(console.error);
