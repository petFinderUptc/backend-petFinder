/**
 * Script de Prueba de Endpoints de Health Check
 *
 * Verifica que todos los endpoints de health funcionan correctamente,
 * incluyendo el nuevo endpoint de database health.
 */

const http = require('http');

const endpoints = [
  { name: 'Main Health Check', path: '/' },
  { name: 'Health Endpoint', path: '/health' },
  { name: 'Info Endpoint', path: '/info' },
  { name: 'Database Health', path: '/api/v1/db-health' },
];

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

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint.path,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            success: true,
            status: res.statusCode,
            data: json,
          });
        } catch (error) {
          resolve({
            success: false,
            status: res.statusCode,
            error: 'Invalid JSON response',
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('🧪 TESTING HEALTH CHECK ENDPOINTS', 'blue');
  console.log('='.repeat(60) + '\n');

  for (const endpoint of endpoints) {
    log(`Testing: ${endpoint.name} (${endpoint.path})`, 'yellow');

    const result = await testEndpoint(endpoint);

    if (result.success && result.status === 200) {
      log(`✅ SUCCESS - Status: ${result.status}`, 'green');

      // Mostrar información relevante según el endpoint
      if (endpoint.path === '/api/v1/db-health') {
        log(`   Database Status: ${result.data.status}`, 'blue');
        log(`   Database Name: ${result.data.database}`, 'blue');
        if (result.data.details) {
          log(`   Resource ID: ${result.data.details.resourceId}`, 'blue');
        }
      } else if (endpoint.path === '/') {
        log(`   API Status: ${result.data.status}`, 'blue');
        log(`   Environment: ${result.data.environment}`, 'blue');
      } else if (endpoint.path === '/health') {
        log(`   Status: ${result.data.status}`, 'blue');
        log(`   Uptime: ${Math.floor(result.data.uptime)}s`, 'blue');
      }
    } else {
      log(`❌ FAILED - ${result.error || 'Status: ' + result.status}`, 'red');
    }

    console.log('');
  }

  console.log('='.repeat(60));
  log('✅ ALL TESTS COMPLETED', 'green');
  console.log('='.repeat(60) + '\n');
}

// Ejecutar tests
runTests().catch((error) => {
  log('\n❌ Error running tests:', 'red');
  console.error(error);
  process.exit(1);
});
