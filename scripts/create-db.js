const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, 'data');
const dbPath = path.join(dataDir, 'ljv_auth.db');

fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS registros_login (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      ingreso_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS equipos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      categoria TEXT NOT NULL,
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS partidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipo_local_id INTEGER NOT NULL,
      equipo_visitante_id INTEGER NOT NULL,
      fecha_partido TEXT NOT NULL,
      hora_partido TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'Programado',
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(equipo_local_id) REFERENCES equipos(id),
      FOREIGN KEY(equipo_visitante_id) REFERENCES equipos(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS torneos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      temporada TEXT NOT NULL,
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

db.close(() => {
  console.log(`Base de datos creada correctamente en: ${dbPath}`);
});
