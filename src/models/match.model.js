// Simula una tabla de partidos mientras no se conecta una base de datos.
const matches = [
  // Registra el primer partido programado.
  { id: 1, homeTeamId: 1, awayTeamId: 2, date: '2026-09-05', time: '10:00', status: 'Programado', homeScore: null, awayScore: null },
  // Registra el segundo partido programado.
  { id: 2, homeTeamId: 3, awayTeamId: 4, date: '2026-09-05', time: '11:30', status: 'Programado', homeScore: null, awayScore: null }
];

// Devuelve todos los partidos registrados.
function findAll() {
  // Retorna el arreglo que representa los datos de partidos.
  return matches;
}

// Exporta la consulta de partidos para el servicio.
module.exports = { findAll };
