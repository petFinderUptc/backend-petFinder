/**
 * Script de prueba para endpoints protegidos con autenticación JWT
 * 
 * Este script demuestra:
 * - Registro de usuario
 * - Login y obtención de token JWT
 * - Acceso a endpoints protegidos con token
 * - Acceso a endpoints solo para ADMIN
 * - Manejo de errores 401 (no autenticado) y 403 (sin permisos)
 * 
 * Asegúrate de tener el servidor corriendo: npm run start:dev
 * 
 * Uso: node scripts/test-protected-endpoints.js
 */

const baseUrl = 'http://localhost:3000/api/v1';

/**
 * Función auxiliar para hacer peticiones HTTP
 */
async function makeRequest(method, path, data = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Agregar token JWT al header Authorization si existe
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  // Agregar body si es POST/PUT
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, options);
    const status = response.status;
    
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = await response.text();
    }

    return { status, data: responseData };
  } catch (error) {
    return { status: 'ERROR', data: { message: error.message } };
  }
}

/**
 * Ejecutar todas las pruebas
 */
async function runTests() {
  console.log('🔐 Prueba de Endpoints Protegidos con JWT\n');
  console.log('='.repeat(70));

  let accessToken = '';
  let userId = '';

  // Test 1: Registrar un nuevo usuario
  console.log('\n📝 Test 1: Registrar usuario');
  console.log('-'.repeat(70));
  
  const registerPayload = {
    email: 'testuser@example.com',
    username: 'testuser',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
  };

  const registerResult = await makeRequest('POST', '/auth/register', registerPayload);
  console.log(`Status: ${registerResult.status}`);
  
  if (registerResult.status === 201 || registerResult.status === 400) {
    if (registerResult.status === 201) {
      console.log('✅ Usuario registrado exitosamente');
      accessToken = registerResult.data.accessToken;
      userId = registerResult.data.user.id;
      console.log(`Token recibido: ${accessToken.substring(0, 30)}...`);
    } else {
      console.log('ℹ️ Usuario ya existe, procediendo con login...');
    }
  } else {
    console.log('❌ Error inesperado');
    console.log(JSON.stringify(registerResult.data, null, 2));
  }

  // Si no obtuvimos token en el registro, intentar login
  if (!accessToken) {
    console.log('\n🔑 Test 1b: Login del usuario');
    console.log('-'.repeat(70));

    const loginPayload = {
      email: 'testuser@example.com',
      password: 'TestPassword123!',
    };

    const loginResult = await makeRequest('POST', '/auth/login', loginPayload);
    console.log(`Status: ${loginResult.status}`);

    if (loginResult.status === 200) {
      console.log('✅ Login exitoso');
      accessToken = loginResult.data.accessToken;
      userId = loginResult.data.user.id;
      console.log(`Token recibido: ${accessToken.substring(0, 30)}...`);
    } else {
      console.log('❌ Error en login');
      console.log(JSON.stringify(loginResult.data, null, 2));
      console.log('\n⚠️ No se puede continuar sin token. Saliendo...');
      return;
    }
  }

  // Test 2: Acceder a endpoint protegido CON token
  console.log('\n\n✅ Test 2: Acceder a /users/profile/me CON token');
  console.log('-'.repeat(70));

  const profileResult = await makeRequest('GET', '/users/profile/me', null, accessToken);
  console.log(`Status: ${profileResult.status}`);

  if (profileResult.status === 200) {
    console.log('✅ Acceso permitido');
    console.log('Perfil del usuario:');
    console.log(JSON.stringify(profileResult.data, null, 2));
  } else {
    console.log('❌ Acceso denegado');
    console.log(JSON.stringify(profileResult.data, null, 2));
  }

  // Test 3: Acceder a endpoint protegido SIN token
  console.log('\n\n❌ Test 3: Acceder a /users/profile/me SIN token');
  console.log('-'.repeat(70));

  const noTokenResult = await makeRequest('GET', '/users/profile/me', null, null);
  console.log(`Status: ${noTokenResult.status}`);

  if (noTokenResult.status === 401) {
    console.log('✅ Rechazado correctamente (401 Unauthorized)');
    console.log(JSON.stringify(noTokenResult.data, null, 2));
  } else {
    console.log('❌ Debería retornar 401');
    console.log(JSON.stringify(noTokenResult.data, null, 2));
  }

  // Test 4: Actualizar perfil propio CON token
  console.log('\n\n✏️ Test 4: Actualizar perfil propio CON token');
  console.log('-'.repeat(70));

  const updatePayload = {
    firstName: 'Test Updated',
    lastName: 'User Updated',
  };

  const updateResult = await makeRequest('PUT', '/users/profile/me', updatePayload, accessToken);
  console.log(`Status: ${updateResult.status}`);

  if (updateResult.status === 200) {
    console.log('✅ Perfil actualizado exitosamente');
    console.log(JSON.stringify(updateResult.data, null, 2));
  } else {
    console.log('❌ Error al actualizar');
    console.log(JSON.stringify(updateResult.data, null, 2));
  }

  // Test 5: Intentar listar todos los usuarios (requiere ADMIN)
  console.log('\n\n🔒 Test 5: Listar todos los usuarios (requiere rol ADMIN)');
  console.log('-'.repeat(70));

  const allUsersResult = await makeRequest('GET', '/users', null, accessToken);
  console.log(`Status: ${allUsersResult.status}`);

  if (allUsersResult.status === 403) {
    console.log('✅ Rechazado correctamente (403 Forbidden - sin permisos)');
    console.log('El usuario no tiene rol ADMIN');
    console.log(JSON.stringify(allUsersResult.data, null, 2));
  } else if (allUsersResult.status === 200) {
    console.log('✅ Acceso permitido (el usuario es ADMIN)');
    console.log(`Usuarios encontrados: ${allUsersResult.data.length}`);
  } else {
    console.log('❌ Status inesperado');
    console.log(JSON.stringify(allUsersResult.data, null, 2));
  }

  // Test 6: Token inválido o expirado
  console.log('\n\n❌ Test 6: Usar token inválido');
  console.log('-'.repeat(70));

  const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token';
  const invalidTokenResult = await makeRequest('GET', '/users/profile/me', null, invalidToken);
  console.log(`Status: ${invalidTokenResult.status}`);

  if (invalidTokenResult.status === 401) {
    console.log('✅ Rechazado correctamente (401 Unauthorized - token inválido)');
    console.log(JSON.stringify(invalidTokenResult.data, null, 2));
  } else {
    console.log('❌ Debería retornar 401');
    console.log(JSON.stringify(invalidTokenResult.data, null, 2));
  }

  // Test 7: Acceder a endpoint público sin token
  console.log('\n\n🌍 Test 7: Acceder a endpoint público /users/:id SIN token');
  console.log('-'.repeat(70));

  if (userId) {
    const publicResult = await makeRequest('GET', `/users/${userId}`, null, null);
    console.log(`Status: ${publicResult.status}`);

    if (publicResult.status === 200) {
      console.log('✅ Acceso permitido (endpoint público)');
      console.log('Usuario obtenido:');
      console.log(JSON.stringify(publicResult.data, null, 2));
    } else {
      console.log('ℹ️ Usuario no encontrado o error');
      console.log(JSON.stringify(publicResult.data, null, 2));
    }
  } else {
    console.log('⚠️ No se tiene userId para probar');
  }

  // Resumen
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 Resumen de Guards Implementados\n');
  console.log('✅ JwtAuthGuard: Protege endpoints que requieren autenticación');
  console.log('✅ RolesGuard: Verifica roles específicos (ej: ADMIN)');
  console.log('✅ @CurrentUser(): Extrae usuario desde el token JWT');
  console.log('✅ @Roles(): Define roles permitidos por endpoint');
  
  console.log('\n📚 Endpoints Protegidos:');
  console.log('  🔒 GET /users/profile/me - Requiere autenticación');
  console.log('  🔒 PUT /users/profile/me - Requiere autenticación');
  console.log('  🔐 GET /users - Requiere rol ADMIN');
  console.log('  🔐 PUT /users/:id - Requiere rol ADMIN');
  console.log('  🔐 DELETE /users/:id - Requiere rol ADMIN');
  
  console.log('\n📚 Endpoints Públicos:');
  console.log('  🌍 POST /auth/register - Público');
  console.log('  🌍 POST /auth/login - Público');
  console.log('  🌍 GET /users/:id - Público');
  
  console.log('\n' + '='.repeat(70));
  console.log('🎉 Pruebas completadas\n');
}

// Verificar disponibilidad de fetch
if (typeof fetch === 'undefined') {
  console.error('❌ Este script requiere Node.js 18+ con soporte para fetch');
  console.log('💡 Alternativa: Usa node --experimental-fetch si tienes una versión anterior');
  process.exit(1);
}

// Ejecutar tests
runTests().catch((error) => {
  console.error('\n❌ Error ejecutando pruebas:', error.message);
  process.exit(1);
});
