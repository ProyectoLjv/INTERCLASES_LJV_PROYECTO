const { createPartido, actualizarResultadoPartido, listarPartidos } = require('../services/gestion.service');
const { getTeams, getMatches } = require('../services/tournament.service');

async function dashboard(req, res) {
  try {
    const equipos = await getTeams();
    const partidos = await listarPartidos();

    res.render('admin/dashboard', {
      title: 'Panel administrador | Interclases LJV',
      user: req.session.user,
      equipos,
      partidos,
      error: null,
      success: null
    });
  } catch (error) {
    res.status(500).render('admin/dashboard', {
      title: 'Panel administrador | Interclases LJV',
      user: req.session.user,
      equipos: [],
      partidos: [],
      error: error.message,
      success: null
    });
  }
}

async function guardarPartido(req, res) {
  try {
    const partido = await createPartido({
      equipoLocalId: req.body.equipoLocalId,
      equipoVisitanteId: req.body.equipoVisitanteId,
      fechaPartido: req.body.fechaPartido,
      horaPartido: req.body.horaPartido,
      estado: req.body.estado || 'Programado'
    });

    const equipos = await getTeams();
    const partidos = await listarPartidos();

    res.render('admin/dashboard', {
      title: 'Panel administrador | Interclases LJV',
      user: req.session.user,
      equipos,
      partidos,
      error: null,
      success: `Partido programado correctamente para ${partido.fechaPartido} a las ${partido.horaPartido}.`
    });
  } catch (error) {
    const equipos = await getTeams();
    const partidos = await listarPartidos();

    res.render('admin/dashboard', {
      title: 'Panel administrador | Interclases LJV',
      user: req.session.user,
      equipos,
      partidos,
      error: error.message,
      success: null
    });
  }
}

async function guardarResultado(req, res) {
  try {
    const resultado = await actualizarResultadoPartido({
      partidoId: req.params.id,
      golesLocal: req.body.golesLocal,
      golesVisitante: req.body.golesVisitante
    });

    const equipos = await getTeams();
    const partidos = await listarPartidos();

    res.render('admin/dashboard', {
      title: 'Panel administrador | Interclases LJV',
      user: req.session.user,
      equipos,
      partidos,
      error: null,
      success: `Resultado actualizado: ${resultado.resultado}`
    });
  } catch (error) {
    const equipos = await getTeams();
    const partidos = await listarPartidos();

    res.render('admin/dashboard', {
      title: 'Panel administrador | Interclases LJV',
      user: req.session.user,
      equipos,
      partidos,
      error: error.message,
      success: null
    });
  }
}

module.exports = { dashboard, guardarPartido, guardarResultado };
