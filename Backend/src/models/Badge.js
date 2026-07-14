const mongoose = require('mongoose')

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    emoji: { type: String, default: '' },
    description: { type: String, default: '' },
    xp: { type: Number, default: 0 },
    color: { type: String, default: '#6366f1' },
    criteria: { type: String, default: '' },
  },
  { timestamps: true }
)

badgeSchema.index({ name: 1 })

module.exports = mongoose.model('Badge', badgeSchema)
