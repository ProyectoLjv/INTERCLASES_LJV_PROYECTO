// Importa Express para crear un enrutador de API.
const express = require('express');
// Importa los controladores relacionados con el torneo.
const tournamentController = require('../controllers/tournament.controller');

// Crea el enrutador que se montara bajo /api.
const router = express.Router();

// Asocia /api/equipos con el listado de equipos.
router.get('/equipos', tournamentController.listTeams);
// Asocia /api/partidos con el listado de partidos.
router.get('/partidos', tournamentController.listMatches);

// Exporta las rutas para registrarlas en app.js.
module.exports = router;
