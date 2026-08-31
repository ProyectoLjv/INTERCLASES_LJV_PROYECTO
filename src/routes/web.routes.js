// Importa Express para crear un enrutador independiente.
const express = require('express');
// Importa el controlador de la pagina principal.
const homeController = require('../controllers/home.controller');
const authController = require('../controllers/auth.controller');

const adminController = require('../controllers/admin.controller');
const capitanController = require('../controllers/capitan.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

// Crea el enrutador para las paginas web.
const router = express.Router();

const registerRoutes = ['/registro', '/register'];
const loginRoutes = ['/login'];

// Asocia la URL raiz con el controlador del home.
router.get('/', homeController.showHome);
loginRoutes.forEach((route) => router.get(route, homeController.showLogin));
registerRoutes.forEach((route) => router.get(route, homeController.showRegister));
loginRoutes.forEach((route) => router.post(route, authController.login));
registerRoutes.forEach((route) => router.post(route, authController.register));
router.get('/logout', authController.logout);

router.get('/admin', requireAuth, requireRole(['admin']), adminController.dashboard);
router.post('/admin/partidos', requireAuth, requireRole(['admin']), adminController.guardarPartido);
router.post('/admin/partidos/:id/resultados', requireAuth, requireRole(['admin']), adminController.guardarResultado);

router.get('/capitan', requireAuth, requireRole(['capitan']), capitanController.dashboard);
router.post('/capitan/equipos', requireAuth, requireRole(['capitan']), capitanController.crearEquipo);
router.post('/capitan/jugadores', requireAuth, requireRole(['capitan']), capitanController.crearJugador);

// Exporta las rutas web para registrarlas en app.js.
module.exports = router;
