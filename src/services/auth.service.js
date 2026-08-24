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

function initDatabase(dbPath = DEFAULT_DB_PATH) {
  const db = openDatabase(dbPath);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `, (error) => {
        if (error) {
          reject(error);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS login_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          logged_in_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  });
}

async function registerUser({ name, email, password }, dbPath = DEFAULT_DB_PATH) {
  await initDatabase(dbPath);

  const trimmedName = String(name || '').trim();
  const trimmedEmail = String(email || '').trim().toLowerCase();
  const trimmedPassword = String(password || '').trim();

  if (!trimmedName || !trimmedEmail || !trimmedPassword) {
    throw new Error('Todos los campos son obligatorios.');
  }

  if (trimmedPassword.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }

  const passwordHash = await bcrypt.hash(trimmedPassword, 10);
  const db = openDatabase(dbPath);

  try {
    const result = await runQuery(db, 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [trimmedName, trimmedEmail, passwordHash]);
    return {
      id: result.id,
      name: trimmedName,
      email: trimmedEmail
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
    const user = await getQuery(db, 'SELECT * FROM users WHERE email = ?', [trimmedEmail]);

    if (!user) {
      throw new Error('Credenciales inválidas.');
    }

    const isValid = await bcrypt.compare(trimmedPassword, user.password_hash);

    if (!isValid) {
      throw new Error('Credenciales inválidas.');
    }

    await runQuery(db, 'INSERT INTO login_logs (email) VALUES (?)', [trimmedEmail]);

    return {
      id: user.id,
      name: user.name,
      email: user.email
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
  openDatabase,
  getQuery,
  runQuery
};
