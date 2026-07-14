const mongoose = require('mongoose')

const eligibilitySchema = new mongoose.Schema(
  {
    minCGPA: { type: Number, default: 0 },
    noBacklogs: { type: Boolean, default: true },
    branches: [{ type: String }],
    maxGap: { type: Number, default: 0 },
    otherCriteria: [{ type: String }],
  },
  { _id: false }
)

const responseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: true },
    status: { type: String, enum: ['accepted', 'rejected'], required: true },
    reason: { type: String },
  },
  { timestamps: true }
)

const companyVisitSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    logo: { type: String, default: '' },
    date: { type: Date, required: true },
    role: { type: String, required: true },
    package: { type: String, default: '' },
    deadline: { type: Date },
    description: { type: String, default: '' },
    eligibility: { type: eligibilitySchema, default: () => ({}) },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    adminNote: { type: String },
    attachmentUrl: { type: String },
    attachmentName: { type: String },
    responses: [responseSchema],
    overview: { type: String },
    interviewProcess: [{ type: String }],
    pastQuestions: [{ type: String }],
    salaryRange: { type: String },
    rounds: { type: Number },
    roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' },
  },
  { timestamps: true }
)

companyVisitSchema.index({ status: 1, date: 1 })
companyVisitSchema.index({ companyName: 1, role: 1 })
companyVisitSchema.index({ roadmapId: 1 })
companyVisitSchema.index({ 'responses.user': 1 })

module.exports = mongoose.model('CompanyVisit', companyVisitSchema)
