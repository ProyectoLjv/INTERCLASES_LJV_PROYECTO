const test = require('node:test');
const assert = require('node:assert/strict');

const { initDatabase, registerUser } = require('../src/services/auth.service');
const {
  createEquipo,
  addJugador,
  createPartido,
  actualizarResultadoPartido,
  listarPartidos
} = require('../src/services/gestion.service');

(async () => {
  test('capitán crea equipo y jugadores y administrador programa y resuelve partido', async () => {
    const dbPath = ':memory:';
    await initDatabase(dbPath);

    await registerUser({
      name: 'Capitán Uno',
      email: 'capitan@ejemplo.com',
      password: '123456',
      role: 'capitan',
      teamName: 'Los Halcones'
    }, dbPath);

    const equipoLocal = await createEquipo({
      nombre: 'Los Halcones',
      categoria: 'Bachillerato',
      emailCapitan: 'capitan@ejemplo.com'
    }, dbPath);

    const equipoVisitante = await createEquipo({
      nombre: 'Los Tigres',
      categoria: 'Bachillerato'
    }, dbPath);

    const jugador = await addJugador({
      equipoId: equipoLocal.id,
      nombre: 'Carlos Torres',
      posicion: 'Delantero'
    }, dbPath);

    assert.equal(jugador.nombre, 'Carlos Torres');

    const partido = await createPartido({
      equipoLocalId: equipoLocal.id,
      equipoVisitanteId: equipoVisitante.id,
      fechaPartido: '2026-09-10',
      horaPartido: '18:00',
      estado: 'Programado'
    }, dbPath);

    await actualizarResultadoPartido({
      partidoId: partido.id,
      golesLocal: 2,
      golesVisitante: 1
    }, dbPath);

    const partidos = await listarPartidos(dbPath);
    const partidoGuardado = partidos.find((item) => item.id === partido.id);

    assert.ok(partidoGuardado);
    assert.equal(partidoGuardado.goles_local, 2);
    assert.equal(partidoGuardado.goles_visitante, 1);
    assert.equal(partidoGuardado.resultado, 'Los Halcones 2 - 1 Los Tigres');
  });
})();
