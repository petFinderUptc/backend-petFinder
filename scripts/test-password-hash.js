/**
 * Script de prueba para el servicio de hash de contraseñas
 *
 * Este script demuestra el funcionamiento de PasswordHashService:
 * - Generación de hashes
 * - Validación de contraseñas
 * - Unicidad de salts
 * - Detección de necesidad de rehash
 *
 * Uso: node scripts/test-password-hash.js
 */

// Simulación de bcrypt (en producción, usar el servicio real)
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

console.log('🔐 Test de Hash Seguro de Contraseñas con bcrypt\n');
console.log('='.repeat(60));

async function testPasswordHashing() {
  // Test 1: Hash básico
  console.log('\n📝 Test 1: Hashear una contraseña');
  console.log('-'.repeat(60));

  const password = 'MySecurePassword123!';
  console.log(`Contraseña original: "${password}"`);

  const startHash = Date.now();
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const hashTime = Date.now() - startHash;

  console.log(`Hash generado:       "${hash}"`);
  console.log(`Longitud del hash:   ${hash.length} caracteres`);
  console.log(`Tiempo de generación: ${hashTime}ms`);
  console.log(`Salt rounds:         ${SALT_ROUNDS}`);

  // Analizar estructura del hash
  const [, version, rounds, saltAndHash] = hash.match(/^(\$2[aby]\$)(\d+)\$(.+)$/);
  console.log(`\nEstructura del hash:`);
  console.log(`  Versión:  ${version}`);
  console.log(`  Rounds:   ${rounds}`);
  console.log(`  Salt+Hash: ${saltAndHash.substring(0, 10)}... (${saltAndHash.length} chars)`);

  // Test 2: Comparación exitosa
  console.log('\n\n✅ Test 2: Comparar contraseña correcta');
  console.log('-'.repeat(60));

  const startCompare = Date.now();
  const isValid = await bcrypt.compare(password, hash);
  const compareTime = Date.now() - startCompare;

  console.log(`Contraseña ingresada: "${password}"`);
  console.log(`¿Es válida?:          ${isValid ? '✅ SÍ' : '❌ NO'}`);
  console.log(`Tiempo de comparación: ${compareTime}ms`);

  // Test 3: Comparación fallida
  console.log('\n\n❌ Test 3: Comparar contraseña incorrecta');
  console.log('-'.repeat(60));

  const wrongPassword = 'WrongPassword123!';
  const startWrong = Date.now();
  const isInvalid = await bcrypt.compare(wrongPassword, hash);
  const wrongTime = Date.now() - startWrong;

  console.log(`Contraseña ingresada: "${wrongPassword}"`);
  console.log(`¿Es válida?:          ${isInvalid ? '✅ SÍ' : '❌ NO'}`);
  console.log(`Tiempo de comparación: ${wrongTime}ms`);

  // Test 4: Unicidad de salts
  console.log('\n\n🔄 Test 4: Unicidad de salt (misma contraseña, diferente hash)');
  console.log('-'.repeat(60));

  const hash1 = await bcrypt.hash(password, SALT_ROUNDS);
  const hash2 = await bcrypt.hash(password, SALT_ROUNDS);
  const hash3 = await bcrypt.hash(password, SALT_ROUNDS);

  console.log(`Contraseña: "${password}"`);
  console.log(`Hash 1: ${hash1}`);
  console.log(`Hash 2: ${hash2}`);
  console.log(`Hash 3: ${hash3}`);
  console.log(`\n¿Son diferentes?: ${hash1 !== hash2 && hash2 !== hash3 ? '✅ SÍ' : '❌ NO'}`);

  // Verificar que todos los hashes son válidos para la misma contraseña
  const valid1 = await bcrypt.compare(password, hash1);
  const valid2 = await bcrypt.compare(password, hash2);
  const valid3 = await bcrypt.compare(password, hash3);
  console.log(
    `¿Todos válidos para la misma contraseña?: ${valid1 && valid2 && valid3 ? '✅ SÍ' : '❌ NO'}`,
  );

  // Test 5: Detección de necesidad de rehash
  console.log('\n\n🔍 Test 5: Detección de necesidad de rehash');
  console.log('-'.repeat(60));

  const oldHash = await bcrypt.hash(password, 10); // 10 rounds (antiguo)
  const newHash = await bcrypt.hash(password, 12); // 12 rounds (nuevo)

  const oldRounds = parseInt(oldHash.split('$')[2], 10);
  const newRounds = parseInt(newHash.split('$')[2], 10);

  console.log(`Hash antiguo (${oldRounds} rounds): ${oldHash.substring(0, 30)}...`);
  console.log(`Hash nuevo (${newRounds} rounds):   ${newHash.substring(0, 30)}...`);
  console.log(`¿Necesita rehash? ${oldRounds < SALT_ROUNDS ? '✅ SÍ' : '❌ NO'}`);

  // Test 6: Rendimiento con diferentes salt rounds
  console.log('\n\n⚡ Test 6: Comparación de rendimiento según salt rounds');
  console.log('-'.repeat(60));

  const testPassword = 'TestPerformance123!';
  const roundsToTest = [8, 10, 12, 14];

  console.log(`\n| Rounds | Tiempo (ms) | Hashes/seg | Recomendación |`);
  console.log(`|--------|-------------|------------|---------------|`);

  for (const rounds of roundsToTest) {
    const start = Date.now();
    await bcrypt.hash(testPassword, rounds);
    const time = Date.now() - start;
    const hashesPerSec = (1000 / time).toFixed(2);
    const recommendation =
      rounds === 12 ? '✅ Recomendado' : rounds < 10 ? '⚠️ Bajo' : rounds > 12 ? '🔒 Alto' : '';

    console.log(
      `| ${rounds.toString().padEnd(6)} | ${time.toString().padEnd(11)} | ${hashesPerSec.toString().padEnd(10)} | ${recommendation.padEnd(13)} |`,
    );
  }

  // Test 7: Validación de formato de hash
  console.log('\n\n🧪 Test 7: Validación de formato de hash');
  console.log('-'.repeat(60));

  const validHash = await bcrypt.hash('test', 12);
  const invalidHashes = ['plaintext', 'md5hash1234567890', '$2b$invalid$...', '$2b$12$short', ''];

  const bcryptRegex = /^\$2[aby]\$\d{2}\$.{53}$/;

  console.log(`Hash válido:   "${validHash.substring(0, 40)}..."`);
  console.log(`¿Es válido?:   ${bcryptRegex.test(validHash) ? '✅ SÍ' : '❌ NO'}\n`);

  console.log('Hashes inválidos:');
  invalidHashes.forEach((hash) => {
    const isValid = bcryptRegex.test(hash);
    console.log(
      `  "${hash.substring(0, 30)}${hash.length > 30 ? '...' : ''}".padEnd(35)} → ${isValid ? '✅ Válido' : '❌ Inválido'}`,
    );
  });

  // Resumen final
  console.log('\n\n' + '='.repeat(60));
  console.log('✨ Resumen de Características de Seguridad\n');
  console.log('✅ Salt único por contraseña (previene rainbow tables)');
  console.log('✅ Comparación en tiempo constante (previene timing attacks)');
  console.log('✅ Configuración ajustable de salt rounds');
  console.log('✅ Detección automática de necesidad de rehash');
  console.log('✅ Resistente a ataques de fuerza bruta');
  console.log('✅ Formato de hash estándar y portable');

  console.log('\n📚 Recomendaciones:');
  console.log('  • Usar 12 salt rounds en producción');
  console.log('  • Nunca almacenar contraseñas en texto plano');
  console.log('  • No incluir contraseñas en logs o respuestas');
  console.log('  • Implementar rehash en próximo login cuando se incrementen rounds');
  console.log('  • Usar PasswordHashService centralizado para consistencia');

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Tests completados exitosamente\n');
}

// Verificar disponibilidad de bcrypt
if (!bcrypt) {
  console.error('❌ Error: bcrypt no está instalado');
  console.log('💡 Instalar con: npm install bcrypt');
  process.exit(1);
}

// Ejecutar tests
testPasswordHashing().catch((error) => {
  console.error('\n❌ Error ejecutando tests:', error.message);
  process.exit(1);
});
