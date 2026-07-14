const mongoose = require('mongoose')

const studyTaskSchema = new mongoose.Schema(
  {
    task: { type: String, required: true, trim: true },
    topic: { type: String, default: 'DSA', trim: true },
    done: { type: Boolean, default: false },
    date: { type: String, required: true },
    time: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

studyTaskSchema.index({ user: 1, date: 1 })
studyTaskSchema.index({ date: 1, topic: 1 })

module.exports = mongoose.model('StudyTask', studyTaskSchema)
