const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const DEFAULT_DB_PATH = path.join(__dirname, '..', '..', 'data', 'ljv_auth.db');
const databaseConnections = new Map();

function ensureDatabaseDirectory(dbPath = DEFAULT_DB_PATH) {
  if (dbPath === ':memory:') {
    return;
  }

  const dir = path.dirname(dbPath);
  fs.mkdirSync(dir, { recursive: true });
}

function openDatabase(dbPath = DEFAULT_DB_PATH) {
  ensureDatabaseDirectory(dbPath);

  if (!databaseConnections.has(dbPath)) {
    const connection = new sqlite3.Database(dbPath);
    databaseConnections.set(dbPath, connection);
  }

  return databaseConnections.get(dbPath);
}

function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function getQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row || null);
    });
  });
}

function addMissingColumn(db, tableName, columnName, columnDefinition) {
  return new Promise((resolve) => {
    db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
      if (err) {
        resolve();
        return;
      }

      const exists = columns.some((column) => column.name === columnName);

      if (exists) {
        resolve();
        return;
      }

      db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`, (alterError) => {
        if (alterError && !/duplicate column/i.test(alterError.message || '')) {
          throw alterError;
        }

        resolve();
      });
    });
  });
}

function initDatabase(dbPath = DEFAULT_DB_PATH) {
  const db = openDatabase(dbPath);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          rol TEXT NOT NULL DEFAULT 'capitan',
          nombre_equipo TEXT,
          creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `, async (error) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          await addMissingColumn(db, 'usuarios', 'rol', "TEXT NOT NULL DEFAULT 'capitan'");
          await addMissingColumn(db, 'usuarios', 'nombre_equipo', 'TEXT');
        } catch (migrationError) {
          reject(migrationError);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS registros_login (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          ingreso_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `, (error) => {
        if (error) {
          reject(error);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS equipos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL UNIQUE,
          categoria TEXT NOT NULL,
          creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `, async (error) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          await addMissingColumn(db, 'equipos', 'categoria', 'TEXT NOT NULL DEFAULT "General"');
        } catch (migrationError) {
          reject(migrationError);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS jugadores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          equipo_id INTEGER NOT NULL,
          nombre TEXT NOT NULL,
          posicion TEXT NOT NULL,
          creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(equipo_id) REFERENCES equipos(id)
        )
      `, (error) => {
        if (error) {
          reject(error);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS partidos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          equipo_local_id INTEGER NOT NULL,
          equipo_visitante_id INTEGER NOT NULL,
          fecha_partido TEXT NOT NULL,
          hora_partido TEXT NOT NULL,
          estado TEXT NOT NULL DEFAULT 'Programado',
          goles_local INTEGER DEFAULT 0,
          goles_visitante INTEGER DEFAULT 0,
          resultado TEXT,
          creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(equipo_local_id) REFERENCES equipos(id),
          FOREIGN KEY(equipo_visitante_id) REFERENCES equipos(id)
        )
      `, async (error) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          await addMissingColumn(db, 'partidos', 'goles_local', 'INTEGER DEFAULT 0');
          await addMissingColumn(db, 'partidos', 'goles_visitante', 'INTEGER DEFAULT 0');
          await addMissingColumn(db, 'partidos', 'resultado', 'TEXT');
        } catch (migrationError) {
          reject(migrationError);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS torneos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          temporada TEXT NOT NULL,
          creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `, async (error) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          await ensureDefaultAdmin(dbPath);
          resolve();
        } catch (seedError) {
          reject(seedError);
        }
      });
    });
  });
}

async function ensureDefaultAdmin(dbPath = DEFAULT_DB_PATH) {
  const db = openDatabase(dbPath);
  const adminEmail = 'admin@ljv.local';
  const adminPassword = 'admin123';
  const adminHash = await bcrypt.hash(adminPassword, 10);

  const existing = await getQuery(db, 'SELECT id FROM usuarios WHERE email = ?', [adminEmail]);

  if (!existing) {
    await runQuery(db, 'INSERT INTO usuarios (nombre, email, password_hash, rol, nombre_equipo) VALUES (?, ?, ?, ?, ?)', ['Administrador', adminEmail, adminHash, 'admin', null]);
  }
}

async function registerUser({ name, email, password, role = 'capitan', teamName }, dbPath = DEFAULT_DB_PATH) {
  await initDatabase(dbPath);

  const trimmedName = String(name || '').trim();
  const trimmedEmail = String(email || '').trim().toLowerCase();
  const trimmedPassword = String(password || '').trim();
  const normalizedRole = String(role || 'capitan').trim().toLowerCase();
  const trimmedTeamName = teamName ? String(teamName).trim() : null;

  if (!trimmedName || !trimmedEmail || !trimmedPassword) {
    throw new Error('Todos los campos son obligatorios.');
  }

  if (!['admin', 'capitan'].includes(normalizedRole)) {
    throw new Error('El rol debe ser administrador o capitán.');
  }

  if (trimmedPassword.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }

  const passwordHash = await bcrypt.hash(trimmedPassword, 10);
  const db = openDatabase(dbPath);

  try {
    const result = await runQuery(
      db,
      'INSERT INTO usuarios (nombre, email, password_hash, rol, nombre_equipo) VALUES (?, ?, ?, ?, ?)',
      [trimmedName, trimmedEmail, passwordHash, normalizedRole, normalizedRole === 'capitan' ? trimmedTeamName : null]
    );

    return {
      id: result.id,
      name: trimmedName,
      email: trimmedEmail,
      role: normalizedRole,
      teamName: normalizedRole === 'capitan' ? trimmedTeamName : null
    };
  } catch (error) {
    if (error && error.code === 'SQLITE_CONSTRAINT') {
      throw new Error('Este correo ya está registrado.');
    }

    throw error;
  }
}

async function loginUser({ email, password }, dbPath = DEFAULT_DB_PATH) {
  await initDatabase(dbPath);

  const trimmedEmail = String(email || '').trim().toLowerCase();
  const trimmedPassword = String(password || '').trim();

  if (!trimmedEmail || !trimmedPassword) {
    throw new Error('Debes ingresar correo y contraseña.');
  }

  const db = openDatabase(dbPath);

  try {
    const user = await getQuery(db, 'SELECT * FROM usuarios WHERE email = ?', [trimmedEmail]);

    if (!user) {
      throw new Error('Credenciales inválidas.');
    }

    const isValid = await bcrypt.compare(trimmedPassword, user.password_hash);

    if (!isValid) {
      throw new Error('Credenciales inválidas.');
    }

    await runQuery(db, 'INSERT INTO registros_login (email) VALUES (?)', [trimmedEmail]);

    return {
      id: user.id,
      name: user.nombre,
      email: user.email,
      role: user.rol || (trimmedEmail === 'admin@ljv.local' ? 'admin' : 'capitan'),
      teamName: user.nombre_equipo
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  DEFAULT_DB_PATH,
  initDatabase,
  registerUser,
  loginUser,
  ensureDefaultAdmin,
  openDatabase,
  getQuery,
  runQuery
};
