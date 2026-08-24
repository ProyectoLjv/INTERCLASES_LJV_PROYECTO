// Importa Express para crear un enrutador independiente.
const express = require('express');
// Importa el controlador de la pagina principal.
const homeController = require('../controllers/home.controller');

// Crea el enrutador para las paginas web.
const router = express.Router();

// Asocia la URL raiz con el controlador del home.
router.get('/', homeController.showHome);

// Exporta las rutas web para registrarlas en app.js.
module.exports = router;
