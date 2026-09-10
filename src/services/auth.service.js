const bcrypt = require('bcryptjs');

const User = require('../models/User');

async function initDatabase() {
  return Promise.resolve();
}

async function ensureDefaultAdmin() {
  const seedAdminMongo = require('../seeds/seedAdminMongo');
  return seedAdminMongo();
}

async function registerUser({ name, email, password, role = 'student', teamName }) {
  const trimmedName = String(name || '').trim();
  const trimmedEmail = String(email || '').trim().toLowerCase();
  const trimmedPassword = String(password || '').trim();
  const normalizedRole = String(role || 'student').trim().toLowerCase();
  const trimmedTeamName = teamName ? String(teamName).trim() : null;

  if (!trimmedName || !trimmedEmail || !trimmedPassword) {
    throw new Error('Todos los campos son obligatorios.');
  }

  if (trimmedName.length < 3) {
    throw new Error('El nombre debe tener al menos 3 caracteres.');
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ]+(?: [A-Za-zÁÉÍÓÚáéíóúÜüÑñ]+)*$/.test(trimmedName)) {
    throw new Error('El nombre solo puede contener letras y espacios.');
  }

  if (!['admin', 'student'].includes(normalizedRole)) {
    throw new Error('El rol no es válido.');
  }

  if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(trimmedPassword)) {
    throw new Error('La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.');
  }

  const existingUser = await User.findOne({ email: trimmedEmail });

  if (existingUser) {
    throw new Error('Este correo ya está registrado.');
  }

  const passwordHash = await bcrypt.hash(trimmedPassword, 10);
  let user;

  try {
    user = await User.create({
      nombre: trimmedName,
      email: trimmedEmail,
      password: passwordHash,
      role: normalizedRole,
      teamName: normalizedRole === 'student' ? trimmedTeamName : null
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new Error('El correo electrónico ya se encuentra registrado. Intenta iniciar sesión o recuperar tu contraseña.');
    }

    throw error;
  }

  return {
    id: user._id.toString(),
    name: user.nombre,
    email: user.email,
    role: user.role,
    teamName: user.teamName
  };
}

async function loginUser({ email, password }) {
  const trimmedEmail = String(email || '').trim().toLowerCase();
  const trimmedPassword = String(password || '').trim();

  if (!trimmedEmail || !trimmedPassword) {
    throw new Error('Debes ingresar correo y contraseña.');
  }

  const user = await User.findOne({ email: trimmedEmail });

  if (!user) {
    throw new Error('No existe una cuenta registrada con ese correo electrónico.');
  }

  const isValid = await bcrypt.compare(trimmedPassword, user.password);

  if (!isValid) {
    throw new Error('La contraseña es incorrecta.');
  }

  return {
    id: user._id.toString(),
    name: user.nombre,
    email: user.email,
    role: user.role,
    teamName: user.teamName
  };
}

module.exports = {
  initDatabase,
  registerUser,
  loginUser,
  ensureDefaultAdmin
};
