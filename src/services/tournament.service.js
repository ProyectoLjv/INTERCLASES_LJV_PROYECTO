const Match = require('../models/Match');
const Team = require('../models/Team');

async function getTeams() {
  const teams = await Team.find({}).sort({ nombre: 1 }).lean();

  return teams.map((team) => ({
    id: team._id.toString(),
    name: team.nombre,
    category: team.categoria
  }));
}

async function getMatches() {
  const matches = await Match.find({}).sort({ fecha: 1, hora: 1 }).lean();

  return matches.map((match) => ({
    id: match._id.toString(),
    homeTeamId: match.equipoLocalId ? match.equipoLocalId.toString() : null,
    awayTeamId: match.equipoVisitanteId ? match.equipoVisitanteId.toString() : null,
    date: match.fecha,
    time: match.hora,
    field: match.cancha,
    status: match.estado,
    homeScore: match.goles_local,
    awayScore: match.goles_visitante,
    homeTeam: match.equipo_a || 'Equipo local',
    awayTeam: match.equipo_b || 'Equipo visitante',
    result: match.resultado || `${match.equipo_a || 'Equipo local'} ${match.goles_local ?? 0} - ${match.goles_visitante ?? 0} ${match.equipo_b || 'Equipo visitante'}`
  }));
}

async function getSummary() {
  const [teams, matches] = await Promise.all([getTeams(), getMatches()]);

  return {
    teamCount: teams.length,
    matchCount: matches.length,
    nextMatch: matches[0] || null
  };
}

module.exports = { getTeams, getMatches, getSummary };
