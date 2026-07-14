const mongoose = require('mongoose')

const contestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    participants: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'completed', 'upcoming'], default: 'upcoming' },
  },
  { timestamps: true }
)

contestSchema.index({ status: 1, start: 1 })

module.exports = mongoose.model('Contest', contestSchema)
