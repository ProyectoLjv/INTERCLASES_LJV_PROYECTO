// Define el middleware global para procesar errores de Express.
function errorHandler(error, req, res, next) {
  // Muestra el error en la terminal para facilitar la depuracion.
  console.error(error);
  // Devuelve una respuesta generica sin exponer detalles internos.
  res.status(500).json({ error: 'Error interno del servidor' });
}

// Exporta el middleware para registrarlo al final de app.js.
module.exports = errorHandler;
