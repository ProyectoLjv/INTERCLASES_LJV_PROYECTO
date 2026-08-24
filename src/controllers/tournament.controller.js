// Importa el servicio con las reglas de negocio del torneo.
const tournamentService = require('../services/tournament.service');

// Atiende las solicitudes que piden todos los equipos.
function listTeams(req, res) {
  // Devuelve los equipos dentro de la propiedad data.
  res.json({ data: tournamentService.getTeams() });
}

// Atiende las solicitudes que piden todos los partidos.
function listMatches(req, res) {
  // Devuelve los partidos enriquecidos dentro de la propiedad data.
  res.json({ data: tournamentService.getMatches() });
}

// Exporta los controladores para conectarlos con las rutas de la API.
module.exports = { listTeams, listMatches };
