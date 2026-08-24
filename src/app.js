// Importa Express para crear y configurar el servidor web.
const express = require('express');
// Importa path para construir rutas compatibles con el sistema operativo.
const path = require('path');
const session = require('express-session');
// Importa las rutas que renderizan las paginas web.
const webRoutes = require('./routes/web.routes');
// Importa las rutas que devuelven datos en formato JSON.
const apiRoutes = require('./routes/api.routes');
// Importa el middleware global para manejar errores.
const errorHandler = require('./middlewares/error-handler');
const { initDatabase } = require('./services/auth.service');

// Crea la instancia principal de la aplicacion Express.
const app = express();

// Indica que las vistas utilizaran plantillas EJS.
app.set('view engine', 'ejs');
// Define la carpeta donde se encuentran las vistas.
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'interclases-ljv-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8
  }
}));

// Permite recibir solicitudes con cuerpos JSON.
app.use(express.json());
// Permite recibir datos enviados desde formularios HTML.
app.use(express.urlencoded({ extended: true }));
// Publica archivos estaticos como CSS, imagenes y JavaScript del navegador.
app.use(express.static(path.join(__dirname, 'public')));

initDatabase().catch((error) => {
  console.error('No se pudo inicializar la base de datos de autenticacion:', error);
});

// Registra las rutas de las paginas web desde la raiz del sitio.
app.use('/', webRoutes);
// Registra las rutas de la API con el prefijo /api.
app.use('/api', apiRoutes);

// Responde cuando ninguna ruta registrada coincide con la solicitud.
app.use((req, res) => {
  // Devuelve el codigo HTTP 404 y un mensaje en JSON.
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Registra el middleware que procesa los errores de la aplicacion.
app.use(errorHandler);

// Exporta la aplicacion para utilizarla desde server.js y las pruebas.
module.exports = app;
