const mongoose = require('mongoose')

const judgeConfigSchema = new mongoose.Schema(
  {
    problemId: { type: String, required: true, trim: true },
    timeLimit: { type: Number, default: 1000 },
    memoryLimit: { type: Number, default: 256 },
    languages: [{ type: String }],
    checker: { type: String, default: 'exact_match' },
  },
  { timestamps: true }
)

judgeConfigSchema.index({ problemId: 1 })

module.exports = mongoose.model('JudgeConfig', judgeConfigSchema)
