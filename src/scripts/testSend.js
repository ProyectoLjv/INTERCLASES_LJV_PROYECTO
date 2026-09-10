require('dotenv').config();

const { createMailer } = require('../config/mailer');

async function sendTestEmail() {
  const mailer = createMailer();
  const info = await mailer.sendMail({
    from: process.env.EMAIL_USER,
    to: 'anjelitoxk@gmail.com',
    subject: 'Prueba Directa de Recuperación',
    text: 'Este es un correo de prueba enviado directamente con Nodemailer para verificar el envío de recuperación de contraseña.'
  });

  console.log(`Correo enviado correctamente. Message ID: ${info.messageId}`);
  mailer.close();
}

sendTestEmail().catch((error) => {
  console.error('No se pudo enviar el correo de prueba:', error);
  process.exitCode = 1;
});