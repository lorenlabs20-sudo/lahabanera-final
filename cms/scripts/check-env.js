// cms/scripts/check-env.js
const required = ['JWT_SECRET', 'ADMIN_PASSWORD'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ ERROR DE SEGURIDAD: Faltan variables de entorno críticas:', missing.join(', '));
  console.error('-> Copia .env.local.example a .env.local y configúralas.');
  process.exit(1);
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
  console.error('❌ ERROR DE SEGURIDAD: JWT_SECRET es demasiado corta (mínimo 16 caracteres).');
  process.exit(1);
}

console.log('✅ Variables de entorno verificadas correctamente.');