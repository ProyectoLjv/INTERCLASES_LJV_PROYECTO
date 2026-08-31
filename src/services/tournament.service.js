const { openDatabase, getQuery } = require('./auth.service');

const DEFAULT_DB_PATH = require('node:path').join(__dirname, '..', '..', 'data', 'ljv_auth.db');

function getDb(dbPath = DEFAULT_DB_PATH) {
  return openDatabase(dbPath);
}

async function getTeams(dbPath = DEFAULT_DB_PATH) {
  const db = getDb(dbPath);

  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM equipos ORDER BY nombre ASC', (err, rows) => {
      if (err) return reject(err);
      resolve(rows.map((team) => ({
        id: team.id,
        name: team.nombre,
        category: team.categoria
      })));
    });
  });
}

async function getMatches(dbPath = DEFAULT_DB_PATH) {
  const db = getDb(dbPath);

  return new Promise((resolve, reject) => {
    db.all(
      `
        SELECT p.*, e1.nombre AS equipo_local, e2.nombre AS equipo_visitante
        FROM partidos p
        LEFT JOIN equipos e1 ON e1.id = p.equipo_local_id
        LEFT JOIN equipos e2 ON e2.id = p.equipo_visitante_id
        ORDER BY p.fecha_partido ASC, p.hora_partido ASC
      `,
      (err, rows) => {
        if (err) return reject(err);
        resolve((rows || []).map((match) => ({
          id: match.id,
          homeTeamId: match.equipo_local_id,
          awayTeamId: match.equipo_visitante_id,
          date: match.fecha_partido,
          time: match.hora_partido,
          status: match.estado,
          homeScore: match.goles_local,
          awayScore: match.goles_visitante,
          homeTeam: match.equipo_local,
          awayTeam: match.equipo_visitante,
          result: match.resultado || `${match.equipo_local || 'Equipo local'} ${match.goles_local ?? 0} - ${match.goles_visitante ?? 0} ${match.equipo_visitante || 'Equipo visitante'}`
        })));
      }
    );
  });
}

async function getSummary(dbPath = DEFAULT_DB_PATH) {
  const [teams, matches] = await Promise.all([getTeams(dbPath), getMatches(dbPath)]);

  return {
    teamCount: teams.length,
    matchCount: matches.length,
    nextMatch: matches[0] || null
  };
}

module.exports = { getTeams, getMatches, getSummary };
