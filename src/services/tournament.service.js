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
    homeScore: match.goles_a !== undefined ? match.goles_a : (match.goles_local ?? 0),
    awayScore: match.goles_b !== undefined ? match.goles_b : (match.goles_visitante ?? 0),
    homeTeam: match.equipo_a || 'Equipo local',
    awayTeam: match.equipo_b || 'Equipo visitante',
    result: match.resultado || `${match.equipo_a || 'Equipo local'} ${match.goles_a ?? match.goles_local ?? 0} - ${match.goles_b ?? match.goles_visitante ?? 0} ${match.equipo_b || 'Equipo visitante'}`
  }));
}

async function getCalendarMatches() {
  const rawMatches = await Match.find({}).sort({ fecha: 1, hora: 1 }).lean();

  const formattedMatches = rawMatches.map((match) => {
    const homeTeam = match.equipo_a || 'Equipo local';
    const awayTeam = match.equipo_b || 'Equipo visitante';
    const homeScore = Number(match.goles_a !== undefined ? match.goles_a : (match.goles_local ?? 0));
    const awayScore = Number(match.goles_b !== undefined ? match.goles_b : (match.goles_visitante ?? 0));
    const status = (match.estado || 'Pendiente').trim();

    let winner = 'draw';
    if (homeScore > awayScore) winner = 'home';
    else if (awayScore > homeScore) winner = 'away';

    return {
      id: match._id ? match._id.toString() : '',
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      winner,
      date: match.fecha || 'Fecha por definir',
      time: match.hora || 'Hora por definir',
      field: match.cancha || 'Cancha principal',
      status,
      result: match.resultado || `${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`
    };
  });

  const upcoming = formattedMatches.filter((m) => {
    const s = m.status.toLowerCase();
    return s === 'pendiente' || s === 'programado' || s === 'en vivo';
  });

  const finished = formattedMatches.filter((m) => {
    const s = m.status.toLowerCase();
    return s === 'finalizado' || s === 'completado' || s === 'terminado';
  });

  return {
    upcoming,
    finished,
    all: formattedMatches
  };
}

async function getSummary() {
  const [teams, matches] = await Promise.all([getTeams(), getMatches()]);

  return {
    teamCount: teams.length,
    matchCount: matches.length,
    nextMatch: matches[0] || null
  };
}

module.exports = { getTeams, getMatches, getCalendarMatches, getSummary };
