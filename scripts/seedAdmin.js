require('dotenv').config();

const bcrypt = require('bcryptjs');
const {
  DEFAULT_DB_PATH,
  initDatabase,
  openDatabase,
  getQuery,
  runQuery
} = require('../src/services/auth.service');

const ADMIN_USERS = [
  { name: 'Ángel Orlando Briceño Chacón', email: 'anjelitoxk@gmail.com' },
  { name: 'Samuel Atencio Cano', email: 'samuelatencioc@ljv.edu.co' },
  { name: 'Thomas Castro Arredondo', email: 'thomascastro650@gmail.com' },
  { name: 'Deiby Andrés Manco Guisao', email: 'Deiby1425.a@gmail.com' },
  { name: 'Alejandro Restrepo Mira', email: 'alejorestrepo6789@gmail.com' }
];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const THOMAS_ADMIN_PASSWORD = process.env.THOMAS_ADMIN_PASSWORD;

async function seedAdmin(dbPath = DEFAULT_DB_PATH) {
  await initDatabase(dbPath);
  const db = openDatabase(dbPath);
  const results = [];
  const missing = [];

  for (const admin of ADMIN_USERS) {
    const email = admin.email.toLowerCase();
    const existingUser = await getQuery(db, 'SELECT id FROM usuarios WHERE email = ?', [email]);

    if (existingUser) {
      await runQuery(db, 'UPDATE usuarios SET rol = ? WHERE id = ?', ['admin', existingUser.id]);
      if (email === 'thomascastro650@gmail.com' && THOMAS_ADMIN_PASSWORD) {
        if (THOMAS_ADMIN_PASSWORD.length < 8) {
          throw new Error('La contraseña de Thomas debe tener al menos 8 caracteres.');
        }

        const passwordHash = await bcrypt.hash(THOMAS_ADMIN_PASSWORD, 12);
        await runQuery(db, 'UPDATE usuarios SET password_hash = ? WHERE id = ?', [passwordHash, existingUser.id]);
        results.push({ action: 'password-updated', id: existingUser.id, email });
      }
      results.push({ action: 'updated', id: existingUser.id, email });
      continue;
    }

    if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 6) {
      missing.push(email);
      continue;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const result = await runQuery(
      db,
      'INSERT INTO usuarios (nombre, email, password_hash, rol, nombre_equipo) VALUES (?, ?, ?, ?, ?)',
      [admin.name, email, passwordHash, 'admin', null]
    );
    results.push({ action: 'created', id: result.id, email });
  }

  return { results, missing };
}

if (require.main === module) {
  seedAdmin()
    .then(({ results, missing }) => {
      results.forEach((result) => console.log(`Administrador ${result.action}: ${result.email}`));
      if (missing.length) {
        throw new Error(`Faltan cuentas por crear: ${missing.join(', ')}. Define ADMIN_PASSWORD para crearlas.`);
      }
      openDatabase().close(() => {
        process.exitCode = 0;
      });
    })
    .catch((error) => {
      console.error(`No se pudo crear la semilla de administrador: ${error.message}`);
      openDatabase().close(() => {
        process.exitCode = 1;
      });
    });
}

module.exports = { seedAdmin };
