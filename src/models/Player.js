const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  equipo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  posicion: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: {
    createdAt: 'creado_en',
    updatedAt: false
  }
});

module.exports = mongoose.model('Player', playerSchema);