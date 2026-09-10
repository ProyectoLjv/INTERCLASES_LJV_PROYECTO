const mongoose = require('mongoose');

async function connectDB() {
  if (!process.env.MONGO_URI) {
    const error = new Error('MONGO_URI no está definido. Verifica que exista .env en la raíz del proyecto, junto a package.json y server.js.');
    console.error(error.message);
    throw error;
  }

  try {
    mongoose.set('bufferCommands', false);
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log(`MongoDB conectado correctamente: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error('Error al conectar con MongoDB Atlas:', error);
    throw error;
  }
}

module.exports = { connectDB };
