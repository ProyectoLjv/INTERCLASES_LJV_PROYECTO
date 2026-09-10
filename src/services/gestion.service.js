const Team = require('../models/Team');
const Player = require('../models/Player');
const Match = require('../models/Match');
const User = require('../models/User');

async function createEquipo({ nombre, categoria, emailCapitan }) {
  const trimmedNombre = String(nombre || '').trim();
  const trimmedCategoria = String(categoria || '').trim();

  if (!trimmedNombre || !trimmedCategoria) {
    throw new Error('El nombre y la categoría del equipo son obligatorios.');
  }

  const existing = await Team.findOne({ nombre: trimmedNombre });

  if (existing) {
    return {
      id: existing._id.toString(),
      nombre: existing.nombre,
      categoria: existing.categoria
    };
  }

  const equipo = await Team.create({
    nombre: trimmedNombre,
    categoria: trimmedCategoria,
    capitanEmail: emailCapitan ? String(emailCapitan).trim().toLowerCase() : null
  });

  if (emailCapitan) {
    await User.updateOne({ email: String(emailCapitan).trim().toLowerCase() }, { $set: { teamName: trimmedNombre } });
  }

  return {
    id: equipo._id.toString(),
    nombre: equipo.nombre,
    categoria: equipo.categoria
  };
}

async function addJugador({ equipoId, nombre, posicion }) {
  const trimmedNombre = String(nombre || '').trim();
  const trimmedPosicion = String(posicion || '').trim();

  if (!equipoId || !trimmedNombre || !trimmedPosicion) {
    throw new Error('Todos los campos del jugador son obligatorios.');
  }

  const equipo = await Team.findById(equipoId);

  if (!equipo) {
    throw new Error('No existe ese equipo.');
  }

  const jugador = await Player.create({
    equipo_id: equipo._id,
    nombre: trimmedNombre,
    posicion: trimmedPosicion
  });

  return {
    id: jugador._id.toString(),
    equipoId: jugador.equipo_id.toString(),
    nombre: jugador.nombre,
    posicion: jugador.posicion
  };
}

async function createPartido({ equipoLocalId, equipoVisitanteId, fechaPartido, horaPartido, cancha, estado = 'Pendiente' }) {
  if (!equipoLocalId || !equipoVisitanteId || equipoLocalId === equipoVisitanteId || !fechaPartido || !horaPartido || !cancha) {
    throw new Error('Faltan datos para crear el partido.');
  }

  const local = await Team.findById(equipoLocalId);
  const visitante = await Team.findById(equipoVisitanteId);

  if (!local || !visitante) {
    throw new Error('Los equipos del partido no existen.');
  }

  const partido = await Match.create({
    equipoLocalId: local._id,
    equipoVisitanteId: visitante._id,
    equipo_a: local.nombre,
    equipo_b: visitante.nombre,
    fecha: fechaPartido,
    hora: horaPartido,
    cancha: String(cancha).trim(),
    estado,
    goles_local: 0,
    goles_visitante: 0
  });

  return {
    id: partido._id.toString(),
    equipoLocalId: local._id.toString(),
    equipoVisitanteId: visitante._id.toString(),
    fechaPartido: partido.fecha,
    horaPartido: partido.hora,
    cancha: partido.cancha,
    estado: partido.estado
  };
}

async function actualizarResultadoPartido({ partidoId, golesLocal, golesVisitante }) {
  const partido = await Match.findById(partidoId);

  if (!partido) {
    throw new Error('No existe ese partido.');
  }

  const resultado = `${partido.equipo_a} ${Number(golesLocal)} - ${Number(golesVisitante)} ${partido.equipo_b}`;

  partido.goles_local = Number(golesLocal);
  partido.goles_visitante = Number(golesVisitante);
  partido.estado = 'Finalizado';
  partido.resultado = resultado;
  await partido.save();

  return { id: partido._id.toString(), resultado };
}

async function listarPartidos() {
  const partidos = await Match.find({}).sort({ fecha: 1, hora: 1 }).lean();

  return partidos.map((partido) => ({
    id: partido._id.toString(),
    equipo_local_id: partido.equipoLocalId ? partido.equipoLocalId.toString() : null,
    equipo_visitante_id: partido.equipoVisitanteId ? partido.equipoVisitanteId.toString() : null,
    equipo_local: partido.equipo_a,
    equipo_visitante: partido.equipo_b,
    fecha_partido: partido.fecha,
    hora_partido: partido.hora,
    cancha: partido.cancha,
    estado: partido.estado,
    goles_local: partido.goles_local,
    goles_visitante: partido.goles_visitante,
    resultado: partido.resultado || `${partido.equipo_a} ${partido.goles_local ?? 0} - ${partido.goles_visitante ?? 0} ${partido.equipo_b}`
  }));
}

module.exports = {
  createEquipo,
  addJugador,
  createPartido,
  actualizarResultadoPartido,
  listarPartidos
};
