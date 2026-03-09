/**
 * Script de prueba para demostrar operaciones CRUD
 * con el contenedor users usando partition key /email
 */

require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');
const { v4: uuidv4 } = require('uuid');

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE || 'petfinder';

async function testUserOperations() {
  console.log('🧪 Probando operaciones CRUD con partition key /email\n');

  try {
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    const container = database.container('users');

    // ✅ 1. CREATE - Crear un usuario
    console.log('📝 1. CREATE: Creando usuario de prueba...');
    const testUser = {
      id: uuidv4(),
      email: 'test@petfinder.com', // Partition key
      username: 'test_user',
      name: 'Test User',
      password: 'hashed_password_here',
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { resource: created } = await container.items.create(testUser);
    console.log('   ✅ Usuario creado:', created.id);
    console.log('   📧 Email (partition key):', created.email);
    console.log();

    // ✅ 2. READ by Email (usando partition key - MUY EFICIENTE)
    console.log('📖 2. READ by Email (single-partition query):');
    const queryByEmail = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [{ name: '@email', value: testUser.email }],
    };
    
    const { resources: byEmail } = await container.items
      .query(queryByEmail)
      .fetchAll();
    
    console.log('   ✅ Usuario encontrado por email:', byEmail[0].username);
    console.log('   💰 Consulta optimizada: single-partition (2-3 RUs)');
    console.log();

    // ✅ 3. READ by ID (requiere query porque no tenemos partition key)
    console.log('📖 3. READ by ID (cross-partition query):');
    const queryById = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: created.id }],
    };
    
    const { resources: byId } = await container.items
      .query(queryById)
      .fetchAll();
    
    console.log('   ✅ Usuario encontrado por ID:', byId[0].email);
    console.log('   ⚠️  Cross-partition query (más costoso en RUs)');
    console.log();

    // ✅ 4. READ by Username (usando índice compuesto)
    console.log('📖 4. READ by Username (índice compuesto optimizado):');
    const queryByUsername = {
      query: `
        SELECT * FROM c 
        WHERE c.username = @username
        ORDER BY c.createdAt DESC
      `,
      parameters: [{ name: '@username', value: 'test_user' }],
    };
    
    const { resources: byUsername } = await container.items
      .query(queryByUsername)
      .fetchAll();
    
    console.log('   ✅ Usuario encontrado por username:', byUsername[0].email);
    console.log('   💰 Consulta optimizada: índice compuesto (3-5 RUs)');
    console.log();

    // ✅ 5. UPDATE (requiere id + email como partition key)
    console.log('🔄 5. UPDATE: Actualizando usuario...');
    const { resource: existing } = await container
      .item(created.id, created.email)
      .read();
    
    const updated = {
      ...existing,
      name: 'Test User Updated',
      updatedAt: new Date().toISOString(),
    };

    const { resource: replaced } = await container
      .item(created.id, created.email)
      .replace(updated);
    
    console.log('   ✅ Usuario actualizado:', replaced.name);
    console.log('   💡 Operación directa requiere id + email (partition key)');
    console.log();

    // ✅ 6. QUERY by Role (usando índice compuesto)
    console.log('🔍 6. QUERY by Role (índice compuesto):');
    const queryByRole = {
      query: `
        SELECT * FROM c 
        WHERE c.role = @role
        ORDER BY c.createdAt DESC
      `,
      parameters: [{ name: '@role', value: 'user' }],
    };
    
    const { resources: byRole } = await container.items
      .query(queryByRole)
      .fetchAll();
    
    console.log(`   ✅ Usuarios con role 'user': ${byRole.length}`);
    console.log('   💰 Consulta optimizada: índice compuesto role + createdAt');
    console.log();

    // ✅ 7. DELETE (requiere id + email como partition key)
    console.log('🗑️  7. DELETE: Eliminando usuario de prueba...');
    await container.item(created.id, created.email).delete();
    console.log('   ✅ Usuario eliminado exitosamente');
    console.log('   💡 Operación requiere id + email (partition key)');
    console.log();

    console.log('✅ Todas las operaciones completadas exitosamente');
    console.log('\n📊 Resumen de Optimizaciones:');
    console.log('   • Partition key /email: lecturas ultra-rápidas por email');
    console.log('   • Índice compuesto username + createdAt: búsquedas eficientes');
    console.log('   • Índice compuesto role + createdAt: filtrado por rol optimizado');
    console.log('   • Operaciones directas (read/update/delete) requieren email');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

testUserOperations().catch(console.error);
