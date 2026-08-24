// Exporta la configuracion general del entorno de ejecucion.
module.exports = {
  // Define el puerto del servidor o usa 3000 si no existe.
  port: process.env.PORT || 3000,
  // Define el entorno actual o usa development como valor predeterminado.
  nodeEnv: process.env.NODE_ENV || 'development'
};
