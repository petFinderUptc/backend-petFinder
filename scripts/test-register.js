/**
 * Script de prueba para el endpoint de registro
 * Asegúrate de tener el servidor corriendo: npm run start:dev
 */

const baseUrl = 'http://localhost:3000/auth/register';

/**
 * Función auxiliar para hacer peticiones POST
 */
async function testRegister(testName, payload, expectedStatus) {
  try {
    console.log(`\n🧪 Test: ${testName}`);
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const status = response.status;
    const data = await response.json();

    console.log(`📊 Status: ${status}`);
    console.log('📥 Response:', JSON.stringify(data, null, 2));

    if (status === expectedStatus) {
      console.log(`✅ PASSED - Expected status ${expectedStatus}`);
    } else {
      console.log(`❌ FAILED - Expected ${expectedStatus}, got ${status}`);
    }

    return { status, data };
  } catch (error) {
    console.error(`❌ ERROR: ${error.message}`);
    return null;
  }
}

/**
 * Ejecutar todas las pruebas
 */
async function runTests() {
  console.log('🚀 Iniciando pruebas del endpoint de registro\n');
  console.log('='.repeat(60));

  // Test 1: Registro exitoso
  await testRegister(
    'Registro exitoso',
    {
      email: 'juan.perez@example.com',
      username: 'juanperez',
      password: 'Password123!',
      firstName: 'Juan',
      lastName: 'Pérez',
    },
    201, // Código esperado: Created
  );

  // Esperar un poco para que se procese
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Test 2: Email duplicado
  await testRegister(
    'Email duplicado (debe retornar 400)',
    {
      email: 'juan.perez@example.com', // Email duplicado
      username: 'otrouser',
      password: 'Password123!',
      firstName: 'Otro',
      lastName: 'Usuario',
    },
    400, // Código esperado: Bad Request
  );

  // Test 3: Username duplicado
  await testRegister(
    'Username duplicado (debe retornar 400)',
    {
      email: 'otro@example.com',
      username: 'juanperez', // Username duplicado
      password: 'Password123!',
      firstName: 'Otro',
      lastName: 'Usuario',
    },
    400, // Código esperado: Bad Request
  );

  // Test 4: Email inválido
  await testRegister(
    'Email con formato inválido (debe retornar 400)',
    {
      email: 'emailinvalido', // Email sin formato correcto
      username: 'testuser1',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    },
    400, // Código esperado: Bad Request
  );

  // Test 5: Username con caracteres inválidos
  await testRegister(
    'Username con caracteres especiales no permitidos (debe retornar 400)',
    {
      email: 'test@example.com',
      username: 'user@#$%', // Username inválido
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    },
    400, // Código esperado: Bad Request
  );

  // Test 6: Contraseña muy corta
  await testRegister(
    'Contraseña muy corta (debe retornar 400)',
    {
      email: 'test2@example.com',
      username: 'testuser2',
      password: '123', // Menos de 8 caracteres
      firstName: 'Test',
      lastName: 'User',
    },
    400, // Código esperado: Bad Request
  );

  // Test 7: Campos faltantes
  await testRegister(
    'Campos requeridos faltantes (debe retornar 400)',
    {
      email: 'test3@example.com',
      // username faltante
      password: 'Password123!',
    },
    400, // Código esperado: Bad Request
  );

  console.log('\n' + '='.repeat(60));
  console.log('✨ Pruebas completadas\n');
}

// Verificar que fetch esté disponible (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ Este script requiere Node.js 18+ con soporte para fetch');
  console.log('💡 Alternativa: Usa node --experimental-fetch si tienes una versión anterior');
  process.exit(1);
}

// Ejecutar las pruebas
runTests().catch((error) => {
  console.error('❌ Error ejecutando pruebas:', error);
  process.exit(1);
});
