require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { connectDB } = require('../config/db');
const User = require('../models/User');

const ADMIN_EMAIL = 'anjelitoxk@gmail.com';
const NEW_PASSWORD = 'HolamegustaJuanita55*';

async function changePassword() {
  await connectDB();

  const user = await User.findOne({ email: ADMIN_EMAIL });

  if (!user) {
    throw new Error(`No existe un usuario con el correo ${ADMIN_EMAIL}.`);
  }

  user.password = await bcrypt.hash(NEW_PASSWORD, 10);
  await user.save();

  console.log(`Contraseña actualizada correctamente para ${user.email}.`);
}

changePassword()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('No se pudo cambiar la contraseña:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  });