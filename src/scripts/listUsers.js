require('dotenv').config();

const mongoose = require('mongoose');

const { connectDB } = require('../config/db');
const User = require('../models/User');

async function listUsers() {
  await connectDB();

  const users = await User.find({}, 'nombre email role creado_en teamName')
    .sort({ creado_en: 1 })
    .lean();

  console.table(users.map((user) => ({
    nombre: user.nombre,
    email: user.email,
    role: user.role,
    creado_en: user.creado_en,
    teamName: user.teamName
  })));
}

listUsers()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('No se pudieron listar los usuarios:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  });