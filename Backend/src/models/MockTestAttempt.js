const mongoose = require('mongoose')

const mockTestAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest' },
    testId: { type: String },
    testTitle: { type: String, required: true },
    source: { type: String, enum: ['mock', 'ai'], default: 'mock' },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    timeUsed: { type: Number, required: true },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    questions: { type: mongoose.Schema.Types.Mixed, default: [] },
    review: { type: mongoose.Schema.Types.Mixed, default: [] },
    generatedConfig: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
)

mockTestAttemptSchema.index({ user: 1, createdAt: -1 })
mockTestAttemptSchema.index({ test: 1, createdAt: -1 })
mockTestAttemptSchema.index({ source: 1 })

module.exports = mongoose.model('MockTestAttempt', mockTestAttemptSchema)
