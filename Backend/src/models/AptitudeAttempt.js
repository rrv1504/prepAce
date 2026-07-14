const mongoose = require('mongoose')

const aptitudeAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudeQuestion', required: true },
    selected: { type: Number, required: true },
    correct: { type: Boolean, required: true },
    timeUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
)

aptitudeAttemptSchema.index({ user: 1, question: 1 }, { unique: true })
aptitudeAttemptSchema.index({ question: 1, correct: 1 })

module.exports = mongoose.model('AptitudeAttempt', aptitudeAttemptSchema)
