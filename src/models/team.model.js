// Simula una tabla de equipos mientras no se conecta una base de datos.
const teams = [
  // Registra el primer equipo del torneo.
  { id: 1, name: 'Los Titanes', category: 'Bachillerato' },
  // Registra el segundo equipo del torneo.
  { id: 2, name: 'Futuro LJV', category: 'Bachillerato' },
  // Registra el tercer equipo del torneo.
  { id: 3, name: 'Los Halcones', category: 'Basica' },
  // Registra el cuarto equipo del torneo.
  { id: 4, name: 'Estrellas Verdes', category: 'Basica' }
];

// Devuelve todos los equipos registrados.
function findAll() {
  // Retorna el arreglo que representa los datos de equipos.
  return teams;
}

// Busca un equipo usando su identificador.
function findById(id) {
  // Convierte el identificador recibido a numero y compara cada equipo.
  return teams.find((team) => team.id === Number(id));
}

// Exporta las operaciones disponibles para el servicio.
module.exports = { findAll, findById };
