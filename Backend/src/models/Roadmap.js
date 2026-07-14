const mongoose = require('mongoose')

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    platform: { type: String, default: '' },
    resourceType: { type: String, default: '' },
    searchKeyword: { type: String, default: '' },
    estimatedTime: { type: String, default: '' },
    linkedResourceId: { type: String },
    url: { type: String },
  },
  { _id: true }
)

const dailyTaskSchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, default: 1 },
    taskName: { type: String, default: '' },
    description: { type: String, default: '' },
    estimatedMinutes: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'in-progress', 'done'], default: 'pending' },
  },
  { _id: true }
)

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, default: '' },
    options: [{ type: String }],
    correctAnswer: { type: String, default: '' },
    explanation: { type: String, default: '' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    topic: { type: String, default: '' },
    questionType: { type: String, default: 'MCQ' },
    type: { type: String },
    marks: { type: Number },
    timeLimit: { type: Number },
    correct: { type: Number },
    blankAnswer: { type: String },
    sampleAnswer: { type: String },
    starterCode: { type: mongoose.Schema.Types.Mixed },
    testCases: [{ input: { type: String }, expected: { type: String } }],
    sourceId: { type: String },
  },
  { _id: true }
)

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    estimatedHours: { type: Number, default: 0 },
    learningOutcomes: [{ type: String }],
    prerequisites: [{ type: String }],
    resources: [resourceSchema],
    dailyTasks: [dailyTaskSchema],
    quiz: {
      title: { type: String, default: '' },
      difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
      passingScore: { type: Number, default: 70 },
      distribution: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
      questions: [quizQuestionSchema],
    },
  },
  { _id: true }
)

const roadmapSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    companyName: { type: String, default: '' },
    companyLogo: { type: String, default: '' },
    role: { type: String, default: '' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    durationWeeks: { type: Number, default: 0 },
    hiringRequirements: { type: String, default: '' },
    eligibilityCriteria: { type: String, default: '' },
    additionalNotes: { type: String, default: '' },
    targetCompanies: [{ type: String }],
    duration: { type: String, default: '' },
    phases: [
      {
        title: { type: String, required: true },
        tasks: [{ type: String }],
      },
    ],
    modules: [moduleSchema],
    enrolledCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

roadmapSchema.index({ status: 1, createdAt: -1 })
roadmapSchema.index({ companyName: 1, role: 1 })
roadmapSchema.index({ targetCompanies: 1 })

module.exports = mongoose.model('Roadmap', roadmapSchema)
