const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'DSAProblem', required: true },
    lang: { type: String, required: true },
    code: { type: String, required: true },
    verdict: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'],
      required: true,
    },
    runtime: { type: String },
    memory: { type: String },
    testsPassed: { type: Number, default: 0 },
    totalTests: { type: Number, default: 0 },
  },
  { timestamps: true }
)

submissionSchema.index({ user: 1, createdAt: -1 })
submissionSchema.index({ problem: 1, verdict: 1 })

module.exports = mongoose.model('Submission', submissionSchema)
