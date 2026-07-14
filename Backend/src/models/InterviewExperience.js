const mongoose = require('mongoose')

const interviewExperienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    author: { type: String, default: 'anonymous', trim: true },
    college: { type: String, default: 'College', trim: true },
    avatar: { type: String, default: 'photo-1535713875002-d1d0cf377fde' },
    date: { type: String },
    result: { type: String, enum: ['Selected', 'Rejected', 'Pending'], default: 'Selected' },
    package: { type: String, default: 'N/A' },
    rounds: { type: Number, default: 3 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    tags: [{ type: String }],
    summary: { type: String, required: true },
    timeline: [{ type: String }],
    questions: [{ type: String }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

interviewExperienceSchema.index({ company: 1, result: 1 })
interviewExperienceSchema.index({ tags: 1 })
interviewExperienceSchema.index({ company: 'text', role: 'text', summary: 'text', tags: 'text' })

module.exports = mongoose.model('InterviewExperience', interviewExperienceSchema)
