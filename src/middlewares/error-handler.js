// Define el middleware global para procesar errores de Express.
function errorHandler(error, req, res, next) {
  // Muestra la pila completa del error para facilitar la depuracion.
  console.error(error.stack || error);

  // Devuelve un mensaje util para detectar rapidamente la causa real.
  res.status(500).json({
    error: 'Error interno del servidor',
    details: error && error.message ? error.message : 'Sin detalle disponible'
  });
}

// Exporta el middleware para registrarlo al final de app.js.
module.exports = errorHandler;
