const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    college: { type: String, default: 'Not specified' },
    branch: { type: String, default: 'Not specified' },
    year: { type: String, default: '1st' },
    status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
    placementStatus: {
      type: String,
      enum: ['seeking', 'placed', 'not_seeking'],
      default: 'seeking',
    },
    dsaSolved: { type: Number, default: 0 },
    aptitudeScore: { type: Number, default: 0 },
    mockTestsTaken: { type: Number, default: 0 },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
    dsaStreak: { type: Number, default: 0 },
    totalXP: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    coursesCompleted: { type: Number, default: 0 },
    aptitudeTests: { type: Number, default: 0 },
    strongTopics: [{ type: String }],
    weakTopics: [{ type: String }],
    bio: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    phone: { type: String, default: '' },
    skills: [
      {
        name: { type: String, default: '' },
        level: { type: Number, default: 0 },
        color: { type: String, default: '#6366f1' },
      },
    ],
    certificates: [
      {
        name: { type: String, default: '' },
        issuer: { type: String, default: '' },
        date: { type: String, default: '' },
        color: { type: String, default: '#6366f1' },
      },
    ],
  },
  { timestamps: true }
)

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.index({ role: 1, status: 1 })
userSchema.index({ college: 1, branch: 1, year: 1 })
userSchema.index({ lastActive: -1 })

module.exports = mongoose.model('User', userSchema)
