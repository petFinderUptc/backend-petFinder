/**
 * Script para verificar variables de entorno requeridas
 * Ejecutar antes de iniciar la aplicación en producción
 */

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'API_PREFIX',
  'JWT_SECRET',
  'JWT_EXPIRATION',
  'BCRYPT_SALT_ROUNDS',
  'CORS_ORIGINS',
  'THROTTLE_TTL',
  'THROTTLE_LIMIT',
  'COSMOS_DB_ENDPOINT',
  'COSMOS_DB_KEY',
  'COSMOS_DB_DATABASE',
];

const missingVars = [];
const presentVars = [];

console.log('🔍 Verificando variables de entorno...\n');

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.log(`❌ ${varName}: NO CONFIGURADA`);
  } else {
    presentVars.push(varName);
    // Ocultar valores sensibles
    const isSensitive = varName.includes('SECRET') || varName.includes('KEY');
    const displayValue = isSensitive ? '***HIDDEN***' : process.env[varName].substring(0, 50);
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

console.log('\n========================================');
console.log(`📊 Resumen: ${presentVars.length}/${requiredEnvVars.length} variables configuradas`);
console.log('========================================\n');

if (missingVars.length > 0) {
  console.error('🚨 ERROR: Faltan las siguientes variables de entorno:');
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error('\n⚠️  Configura estas variables en Azure Portal:');
  console.error('   Settings → Configuration → Application settings\n');
  process.exit(1);
} else {
  console.log('✅ Todas las variables de entorno están configuradas correctamente\n');
  process.exit(0);
}
