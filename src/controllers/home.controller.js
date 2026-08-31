// Importa el servicio que contiene la logica del torneo.
const tournamentService = require('../services/tournament.service');

// Atiende la solicitud de la pagina principal.
async function showHome(req, res, next) {
  // Intenta preparar y renderizar la vista.
  try {
    const summary = await tournamentService.getSummary();
    const matches = await tournamentService.getMatches();

    // Renderiza index.ejs y le entrega los datos necesarios.
    res.render('index', {
      // Define el titulo que aparece en el navegador.
      title: 'Interclases LJV',
      // Entrega el resumen de equipos y partidos.
      summary,
      // Entrega la lista de partidos para mostrarla en la vista.
      matches,
      user: req.session && req.session.user ? req.session.user : null
    });
  // Captura cualquier error ocurrido durante el renderizado.
  } catch (error) {
    // Envia el error al middleware global.
    next(error);
  }
}

function showLogin(req, res) {
  res.render('login', {
    title: 'Iniciar sesión | Interclases LJV',
    error: null,
    formData: {}
  });
}

function showRegister(req, res) {
  res.render('register', {
    title: 'Registro | Interclases LJV',
    error: null,
    formData: {}
  });
}

// Exporta el controlador para conectarlo con las rutas web.
module.exports = { showHome, showLogin, showRegister };
