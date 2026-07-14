const mongoose = require('mongoose')

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    expected: { type: String, required: true },
  },
  { _id: false }
)

const dsaProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    topic: { type: String, required: true },
    description: { type: String, required: true },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    constraints: [{ type: String }],
    starterCode: { type: Map, of: String, default: {} },
    companies: [{ type: String }],
    tags: [{ type: String }],
    editorial: { type: String },
    videoLink: { type: String },
    imageUrl: { type: String },
    sampleTestCases: [testCaseSchema],
    hiddenTestCases: [testCaseSchema],
    timeComplexity: { type: String },
    spaceComplexity: { type: String },
    submissions: { type: Number, default: 0 },
    accepted: { type: Number, default: 0 },
    inputParams: [{ type: String }],
  },
  { timestamps: true }
)

dsaProblemSchema.index({ difficulty: 1, topic: 1 })
dsaProblemSchema.index({ companies: 1 })
dsaProblemSchema.index({ title: 'text', topic: 'text', tags: 'text' })

module.exports = mongoose.model('DSAProblem', dsaProblemSchema)
