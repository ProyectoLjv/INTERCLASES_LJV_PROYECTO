const nodemailer = require('nodemailer');

const requiredSettings = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];

function createMailer() {
  const missingSettings = requiredSettings.filter((setting) => !process.env[setting]);

  if (missingSettings.length) {
    throw new Error(`Faltan variables de correo en .env: ${missingSettings.join(', ')}`);
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    },
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

module.exports = { createMailer };