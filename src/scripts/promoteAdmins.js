require('dotenv').config();

const mongoose = require('mongoose');

const { connectDB } = require('../config/db');
const User = require('../models/User');

const ADMIN_EMAILS = [
  'alejorestrepo6789@gmail.com',
  'samuelatencioc@ljv.edu.co',
  'thomascastro650@gmail.com',
  'deiby1425.a@gmail.com'
];

async function promoteAdmins() {
  await connectDB();

  const users = await User.find({ email: { $in: ADMIN_EMAILS } });
  const foundEmails = new Set(users.map((user) => user.email));

  for (const user of users) {
    user.role = 'admin';
    await user.save();
  }

  console.log('Cuentas promovidas a administrador:');
  users.forEach((user) => console.log(`- ${user.email}`));

  const missingEmails = ADMIN_EMAILS.filter((email) => !foundEmails.has(email));
  if (missingEmails.length) {
    console.log('Correos no encontrados:');
    missingEmails.forEach((email) => console.log(`- ${email}`));
  }
}

promoteAdmins()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('No se pudieron promover las cuentas:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  });