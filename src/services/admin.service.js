const path = require('node:path');
const { openDatabase, getQuery, runQuery } = require('./auth.service');

const DEFAULT_DB_PATH = path.join(__dirname, '..', '..', 'data', 'ljv_auth.db');
const MATCH_STATUSES = ['Pendiente', 'En Vivo', 'Finalizado'];

function getDb(dbPath = DEFAULT_DB_PATH) {
  return openDatabase(dbPath);
}

async function getPopup(dbPath = DEFAULT_DB_PATH) {
  const popup = await getQuery(getDb(dbPath), 'SELECT * FROM configuracion_popup WHERE id = 1');
  return popup || { titulo: '¡Bienvenidos!', mensaje: '', activo: 1 };
}

async function updatePopup({ titulo, mensaje, activo }, dbPath = DEFAULT_DB_PATH) {
  const cleanTitle = String(titulo || '').trim();
  const cleanMessage = String(mensaje || '').trim();

  if (!cleanTitle || !cleanMessage) {
    throw new Error('El título y el mensaje del pop-up son obligatorios.');
  }

  await runQuery(
    getDb(dbPath),
    'UPDATE configuracion_popup SET titulo = ?, mensaje = ?, activo = ? WHERE id = 1',
    [cleanTitle, cleanMessage, activo ? 1 : 0]
  );

  return getPopup(dbPath);
}

async function listAdminTeams(dbPath = DEFAULT_DB_PATH) {
  const db = getDb(dbPath);
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, nombre, categoria, puntos, goles_favor, goles_contra
       FROM equipos ORDER BY puntos DESC, goles_favor DESC, nombre ASC`,
      (error, rows) => {
        if (error) return reject(error);
        resolve(rows || []);
      }
    );
  });
}

async function updateTeamStats({ teamId, puntos, golesFavor, golesContra }, dbPath = DEFAULT_DB_PATH) {
  const values = [Number(puntos), Number(golesFavor), Number(golesContra)];
  if (!Number.isInteger(Number(teamId)) || values.some((value) => !Number.isInteger(value) || value < 0)) {
    throw new Error('Las estadísticas del equipo deben ser números enteros positivos.');
  }

  const result = await runQuery(
    getDb(dbPath),
    'UPDATE equipos SET puntos = ?, goles_favor = ?, goles_contra = ? WHERE id = ?',
    [...values, Number(teamId)]
  );

  if (!result.changes) throw new Error('No existe ese equipo.');
  return result;
}

async function listPlayers(dbPath = DEFAULT_DB_PATH) {
  const db = getDb(dbPath);
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT j.id, j.equipo_id, j.nombre, j.posicion, e.nombre AS equipo_nombre
       FROM jugadores j JOIN equipos e ON e.id = j.equipo_id
       ORDER BY e.nombre ASC, j.nombre ASC`,
      (error, rows) => {
        if (error) return reject(error);
        resolve(rows || []);
      }
    );
  });
}

async function updateMatch({ matchId, equipoLocalId, equipoVisitanteId, fechaPartido, horaPartido, cancha, estado }, dbPath = DEFAULT_DB_PATH) {
  if (!equipoLocalId || !equipoVisitanteId || equipoLocalId === equipoVisitanteId || !fechaPartido || !horaPartido || !cancha) {
    throw new Error('Completa todos los datos del partido y usa equipos diferentes.');
  }
  if (!MATCH_STATUSES.includes(estado)) throw new Error('El estado del partido no es válido.');

  const result = await runQuery(
    getDb(dbPath),
    `UPDATE partidos SET equipo_local_id = ?, equipo_visitante_id = ?, fecha_partido = ?,
     hora_partido = ?, cancha = ?, estado = ? WHERE id = ?`,
    [Number(equipoLocalId), Number(equipoVisitanteId), fechaPartido, horaPartido, String(cancha).trim(), estado, Number(matchId)]
  );

  if (!result.changes) throw new Error('No existe ese partido.');
  return result;
}

async function deleteMatch(matchId, dbPath = DEFAULT_DB_PATH) {
  const result = await runQuery(getDb(dbPath), 'DELETE FROM partidos WHERE id = ?', [Number(matchId)]);
  if (!result.changes) throw new Error('No existe ese partido.');
  return result;
}

async function deletePlayer(playerId, dbPath = DEFAULT_DB_PATH) {
  const result = await runQuery(getDb(dbPath), 'DELETE FROM jugadores WHERE id = ?', [Number(playerId)]);
  if (!result.changes) throw new Error('No existe ese jugador.');
  return result;
}

module.exports = {
  MATCH_STATUSES,
  getPopup,
  updatePopup,
  listAdminTeams,
  updateTeamStats,
  listPlayers,
  updateMatch,
  deleteMatch,
  deletePlayer
};
