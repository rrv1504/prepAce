const mongoose = require('mongoose')

const roadmapProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    startedAt: { type: Date, default: Date.now },
    completedTasks: [{ type: String }],
  },
  { timestamps: true }
)

roadmapProgressSchema.index({ user: 1, roadmap: 1 }, { unique: true })

module.exports = mongoose.model('RoadmapProgress', roadmapProgressSchema)
