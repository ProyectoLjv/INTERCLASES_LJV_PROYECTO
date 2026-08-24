// Importa Express para crear un enrutador independiente.
const express = require('express');
// Importa el controlador de la pagina principal.
const homeController = require('../controllers/home.controller');
const authController = require('../controllers/auth.controller');

// Crea el enrutador para las paginas web.
const router = express.Router();

// Asocia la URL raiz con el controlador del home.
router.get('/', homeController.showHome);
router.get('/login', homeController.showLogin);
router.get('/registro', homeController.showRegister);
router.get('/register', homeController.showRegister);
router.post('/login', authController.login);
router.post('/registro', authController.register);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

// Exporta las rutas web para registrarlas en app.js.
module.exports = router;
