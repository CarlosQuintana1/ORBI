const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, lowercase: true, trim: true },
  scores: {
    matematica: { type: Number, default: 0 },
    linguistica: { type: Number, default: 0 },
    espacial: { type: Number, default: 0 },
    musical: { type: Number, default: 0 },
    cinestetica: { type: Number, default: 0 },
    naturalista: { type: Number, default: 0 },
    interpersonal: { type: Number, default: 0 },
    intrapersonal: { type: Number, default: 0 },
  },
  unlockedPlanets: { type: [String], default: ['matematica', 'linguistica'] }
}, { timestamps: true })

module.exports = mongoose.model('Player', playerSchema)
