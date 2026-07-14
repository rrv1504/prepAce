const mongoose = require('mongoose')

const mockQuestionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['mcq', 'fill_blank', 'textual', 'coding'], required: true },
    topic: { type: String, required: true },
    subtopic: { type: String },
    question: { type: String, required: true },
    marks: { type: Number, default: 1 },
    timeLimit: { type: Number, default: 60 },
    explanation: { type: String },
    options: [{ type: String }],
    correct: { type: Number },
    blankAnswer: { type: String },
    sampleAnswer: { type: String },
    starterCode: { type: Map, of: String, default: {} },
    testCases: [{ input: String, expected: String }],
    sourceId: { type: mongoose.Schema.Types.ObjectId },
  },
  { _id: true }
)

const mockTestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['aptitude', 'technical', 'mixed'], required: true },
    duration: { type: Number, required: true },
    questions: [mockQuestionSchema],
    description: { type: String, default: '' },
    totalAttempts: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    liveAt: { type: Date },
  },
  { timestamps: true }
)

mockTestSchema.index({ type: 1, createdAt: -1 })
mockTestSchema.index({ liveAt: 1 })

module.exports = mongoose.model('MockTest', mockTestSchema)
