const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');
const { openDatabase, getQuery, runQuery } = require('./auth.service');

const DEFAULT_DB_PATH = path.join(__dirname, '..', '..', 'data', 'ljv_auth.db');

async function createEquipo({ nombre, categoria, emailCapitan }, dbPath = DEFAULT_DB_PATH) {
  const db = openDatabase(dbPath);
  const trimmedNombre = String(nombre || '').trim();
  const trimmedCategoria = String(categoria || '').trim();

  if (!trimmedNombre || !trimmedCategoria) {
    throw new Error('El nombre y la categoría del equipo son obligatorios.');
  }

  const equipo = await getQuery(db, 'SELECT * FROM equipos WHERE nombre = ?', [trimmedNombre]);

  if (equipo) {
    return equipo;
  }

  const result = await runQuery(
    db,
    'INSERT INTO equipos (nombre, categoria) VALUES (?, ?)',
    [trimmedNombre, trimmedCategoria]
  );

  if (emailCapitan) {
    await runQuery(db, 'UPDATE usuarios SET nombre_equipo = ? WHERE email = ?', [trimmedNombre, String(emailCapitan).trim().toLowerCase()]);
  }

  return {
    id: result.id,
    nombre: trimmedNombre,
    categoria: trimmedCategoria
  };
}

async function addJugador({ equipoId, nombre, posicion }, dbPath = DEFAULT_DB_PATH) {
  const db = openDatabase(dbPath);
  const trimmedNombre = String(nombre || '').trim();
  const trimmedPosicion = String(posicion || '').trim();

  if (!equipoId || !trimmedNombre || !trimmedPosicion) {
    throw new Error('Todos los campos del jugador son obligatorios.');
  }

  const result = await runQuery(
    db,
    'INSERT INTO jugadores (equipo_id, nombre, posicion) VALUES (?, ?, ?)',
    [Number(equipoId), trimmedNombre, trimmedPosicion]
  );

  return {
    id: result.id,
    equipoId: Number(equipoId),
    nombre: trimmedNombre,
    posicion: trimmedPosicion
  };
}

async function createPartido({ equipoLocalId, equipoVisitanteId, fechaPartido, horaPartido, estado = 'Programado' }, dbPath = DEFAULT_DB_PATH) {
  const db = openDatabase(dbPath);

  if (!equipoLocalId || !equipoVisitanteId || !fechaPartido || !horaPartido) {
    throw new Error('Faltan datos para crear el partido.');
  }

  const result = await runQuery(
    db,
    'INSERT INTO partidos (equipo_local_id, equipo_visitante_id, fecha_partido, hora_partido, estado) VALUES (?, ?, ?, ?, ?)',
    [Number(equipoLocalId), Number(equipoVisitanteId), fechaPartido, horaPartido, estado]
  );

  return {
    id: result.id,
    equipoLocalId: Number(equipoLocalId),
    equipoVisitanteId: Number(equipoVisitanteId),
    fechaPartido,
    horaPartido,
    estado
  };
}

async function actualizarResultadoPartido({ partidoId, golesLocal, golesVisitante }, dbPath = DEFAULT_DB_PATH) {
  const db = openDatabase(dbPath);

  const partido = await getQuery(db, 'SELECT * FROM partidos WHERE id = ?', [Number(partidoId)]);
  if (!partido) {
    throw new Error('No existe ese partido.');
  }

  const local = await getQuery(db, 'SELECT nombre FROM equipos WHERE id = ?', [partido.equipo_local_id]);
  const visitante = await getQuery(db, 'SELECT nombre FROM equipos WHERE id = ?', [partido.equipo_visitante_id]);

  const resultado = `${local.nombre} ${Number(golesLocal)} - ${Number(golesVisitante)} ${visitante.nombre}`;

  await runQuery(
    db,
    'UPDATE partidos SET goles_local = ?, goles_visitante = ?, estado = ?, resultado = ? WHERE id = ?',
    [Number(golesLocal), Number(golesVisitante), 'Finalizado', resultado, Number(partidoId)]
  );

  return { id: Number(partidoId), resultado };
}

async function listarPartidos(dbPath = DEFAULT_DB_PATH) {
  const db = openDatabase(dbPath);
  const rows = await new Promise((resolve, reject) => {
    db.all(
      `
        SELECT p.*, e1.nombre AS equipo_local, e2.nombre AS equipo_visitante
        FROM partidos p
        LEFT JOIN equipos e1 ON e1.id = p.equipo_local_id
        LEFT JOIN equipos e2 ON e2.id = p.equipo_visitante_id
        ORDER BY p.fecha_partido ASC, p.hora_partido ASC
      `,
      (err, data) => {
        if (err) return reject(err);
        resolve(data || []);
      }
    );
  });

  return rows.map((partido) => ({
    id: partido.id,
    equipo_local: partido.equipo_local,
    equipo_visitante: partido.equipo_visitante,
    fecha_partido: partido.fecha_partido,
    hora_partido: partido.hora_partido,
    estado: partido.estado,
    goles_local: partido.goles_local,
    goles_visitante: partido.goles_visitante,
    resultado: partido.resultado || `${partido.equipo_local} ${partido.goles_local ?? 0} - ${partido.goles_visitante ?? 0} ${partido.equipo_visitante}`
  }));
}

module.exports = {
  createEquipo,
  addJugador,
  createPartido,
  actualizarResultadoPartido,
  listarPartidos
};
