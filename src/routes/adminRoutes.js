const express = require('express');
const adminController = require('../controllers/admin.controller');
const { esAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(esAdmin);
router.get('/', adminController.dashboard);
router.get('/dashboard', adminController.dashboard);
router.post('/popup', adminController.guardarPopup);
router.post('/equipos', adminController.guardarEquipo);
router.post('/equipos/:id/estadisticas', adminController.guardarEstadisticasEquipo);
router.post('/jugadores', adminController.guardarJugador);
router.post('/jugadores/:id/eliminar', adminController.eliminarJugador);
router.post('/partidos', adminController.guardarPartido);
router.post('/partidos/:id/editar', adminController.editarPartido);
router.post('/partidos/:id/eliminar', adminController.eliminarPartido);
router.post('/partidos/:id/resultados', adminController.guardarResultado);

module.exports = router;
