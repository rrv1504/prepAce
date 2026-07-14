const mongoose = require('mongoose')

const aptitudeQuestionSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    subtopic: { type: String, default: '' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    question: { type: String, required: true },
    options: [{ type: String }],
    correct: { type: Number, required: true },
    explanation: { type: String, default: '' },
    timeLimit: { type: Number, default: 60 },
    marks: { type: Number, default: 1 },
    companyTags: [{ type: String }],
    imageUrl: { type: String },
    attempts: { type: Number, default: 0 },
    correctRate: { type: Number, default: 0 },
  },
  { timestamps: true }
)

aptitudeQuestionSchema.index({ topic: 1, subtopic: 1, difficulty: 1 })
aptitudeQuestionSchema.index({ companyTags: 1 })

module.exports = mongoose.model('AptitudeQuestion', aptitudeQuestionSchema)
