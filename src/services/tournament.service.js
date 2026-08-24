// Importa el modelo encargado de los equipos.
const teamModel = require('../models/team.model');
// Importa el modelo encargado de los partidos.
const matchModel = require('../models/match.model');

// Obtiene todos los equipos mediante el modelo correspondiente.
function getTeams() {
  // Devuelve la informacion de equipos al controlador.
  return teamModel.findAll();
}

// Obtiene los partidos y agrega los nombres de sus equipos.
function getMatches() {
  // Consulta todos los equipos para relacionarlos con los partidos.
  const teams = teamModel.findAll();
  // Crea un mapa que permite buscar el nombre usando el ID del equipo.
  const teamNames = new Map(teams.map((team) => [team.id, team.name]));

  // Recorre los partidos y agrega los nombres localizados.
  return matchModel.findAll().map((match) => ({
    // Conserva todos los datos originales del partido.
    ...match,
    // Agrega el nombre del equipo local.
    homeTeam: teamNames.get(match.homeTeamId),
    // Agrega el nombre del equipo visitante.
    awayTeam: teamNames.get(match.awayTeamId)
  }));
}

// Construye los indicadores principales del torneo.
function getSummary() {
  // Devuelve las cantidades y el siguiente partido disponible.
  return {
    // Cuenta la cantidad total de equipos.
    teamCount: getTeams().length,
    // Cuenta la cantidad total de partidos.
    matchCount: getMatches().length,
    // Selecciona el primer partido o null cuando no hay partidos.
    nextMatch: getMatches()[0] || null
  };
}

// Exporta las operaciones de negocio para controladores y otras capas.
module.exports = { getTeams, getMatches, getSummary };
