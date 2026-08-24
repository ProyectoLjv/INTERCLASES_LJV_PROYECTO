// Carga las variables definidas en el archivo .env.
require('dotenv').config();

// Importa la funcion de Node.js que permite ejecutar comandos del sistema.
const { exec } = require('child_process');
// Importa la aplicacion Express configurada en la capa principal.
const app = require('./src/app');

// Obtiene el puerto del entorno o utiliza el puerto 3000 por defecto.
const PORT = process.env.PORT || 3000;
// Construye la direccion que se mostrara y abrira en el navegador.
const URL = `http://localhost:${PORT}`;

// Define una funcion para abrir automaticamente la pagina principal.
function openBrowser(url) {
  // Permite desactivar la apertura automatica mediante OPEN_BROWSER=false.
  if (process.env.OPEN_BROWSER === 'false') return;

  // Selecciona el comando adecuado segun el sistema operativo.
  const command = process.platform === 'win32'
    // Usa start en Windows.
    ? `start "" "${url}"`
    // Usa open en macOS.
    : process.platform === 'darwin'
      ? `open "${url}"`
      // Usa xdg-open en Linux.
      : `xdg-open "${url}"`;

  // Ejecuta el comando para abrir la URL en el navegador predeterminado.
  exec(command);
}

// Inicia el servidor y ejecuta la funcion cuando queda disponible.
app.listen(PORT, () => {
  // Informa en la terminal la direccion del servidor.
  console.log(`Servidor LJV ejecutandose en ${URL}`);
  // Abre la vista home en el navegador.
  openBrowser(URL);
});
