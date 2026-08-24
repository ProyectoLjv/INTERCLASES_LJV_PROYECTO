// Importa el servicio que contiene la logica del torneo.
const tournamentService = require('../services/tournament.service');

// Atiende la solicitud de la pagina principal.
function showHome(req, res, next) {
  // Intenta preparar y renderizar la vista.
  try {
    // Renderiza index.ejs y le entrega los datos necesarios.
    res.render('index', {
      // Define el titulo que aparece en el navegador.
      title: 'Interclases LJV',
      // Entrega el resumen de equipos y partidos.
      summary: tournamentService.getSummary(),
      // Entrega la lista de partidos para mostrarla en la vista.
      matches: tournamentService.getMatches()
    });
  // Captura cualquier error ocurrido durante el renderizado.
  } catch (error) {
    // Envia el error al middleware global.
    next(error);
  }
}

// Exporta el controlador para conectarlo con las rutas web.
module.exports = { showHome };
