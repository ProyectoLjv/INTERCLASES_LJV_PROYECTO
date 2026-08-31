const { createEquipo, addJugador, listarPartidos } = require('../services/gestion.service');

async function dashboard(req, res) {
  try {
    const partidos = await listarPartidos();
    res.render('capitan/dashboard', {
      title: 'Panel capitán | Interclases LJV',
      user: req.session.user,
      partidos,
      error: null,
      success: null
    });
  } catch (error) {
    res.render('capitan/dashboard', {
      title: 'Panel capitán | Interclases LJV',
      user: req.session.user,
      partidos: [],
      error: error.message,
      success: null
    });
  }
}

async function crearEquipo(req, res) {
  try {
    const equipo = await createEquipo({
      nombre: req.body.nombre,
      categoria: req.body.categoria,
      emailCapitan: req.session.user.email
    });

    const partidos = await listarPartidos();

    res.render('capitan/dashboard', {
      title: 'Panel capitán | Interclases LJV',
      user: { ...req.session.user, teamName: equipo.nombre },
      partidos,
      error: null,
      success: `Equipo ${equipo.nombre} creado correctamente.`
    });
  } catch (error) {
    const partidos = await listarPartidos();

    res.render('capitan/dashboard', {
      title: 'Panel capitán | Interclases LJV',
      user: req.session.user,
      partidos,
      error: error.message,
      success: null
    });
  }
}

async function crearJugador(req, res) {
  try {
    const equipoActual = req.body.equipoId;

    await addJugador({
      equipoId: equipoActual,
      nombre: req.body.nombre,
      posicion: req.body.posicion
    });

    const partidos = await listarPartidos();

    res.render('capitan/dashboard', {
      title: 'Panel capitán | Interclases LJV',
      user: req.session.user,
      partidos,
      error: null,
      success: 'Jugador agregado correctamente.'
    });
  } catch (error) {
    const partidos = await listarPartidos();

    res.render('capitan/dashboard', {
      title: 'Panel capitán | Interclases LJV',
      user: req.session.user,
      partidos,
      error: error.message,
      success: null
    });
  }
}

module.exports = { dashboard, crearEquipo, crearJugador };
