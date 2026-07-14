const jwt = require('jsonwebtoken')
const MockTestAttempt = require('../models/MockTestAttempt')
const Submission = require('../models/Submission')
const User = require('../models/User')
const { forbidden, unauthorized } = require('../utils/appError')

const PROFILE_FIELDS = [
  'name',
  'college',
  'branch',
  'year',
  'bio',
  'github',
  'linkedin',
  'phone',
  'skills',
  'certificates',
]

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

function userPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    college: user.college,
    branch: user.branch,
    year: user.year,
    status: user.status,
    placementStatus: user.placementStatus,
    dsaSolved: user.dsaSolved,
    aptitudeScore: user.aptitudeScore,
    mockTestsTaken: user.mockTestsTaken,
    dsaStreak: user.dsaStreak,
    totalXP: user.totalXP,
    coursesCompleted: user.coursesCompleted,
    aptitudeTests: user.aptitudeTests,
    strongTopics: user.strongTopics || [],
    weakTopics: user.weakTopics || [],
    badges: user.badges || [],
    bio: user.bio || '',
    github: user.github || '',
    linkedin: user.linkedin || '',
    phone: user.phone || '',
    skills: user.skills || [],
    certificates: user.certificates || [],
    joinedAt: user.createdAt ? user.createdAt.toISOString().slice(0, 10) : undefined,
    lastActive: user.lastActive,
  }
}

async function register(input) {
  const user = await User.create({
    ...input,
    role: 'student',
    status: 'pending',
  })
  return userPayload(user)
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.comparePassword(password))) {
    throw unauthorized('Invalid email or password')
  }

  if (user.status === 'pending') {
    throw forbidden('Your account is pending admin approval')
  }

  if (user.status === 'suspended') {
    throw forbidden('Your account has been suspended')
  }

  user.lastActive = new Date()
  await user.save()

  return {
    token: signToken(user),
    user: userPayload(user),
  }
}

async function updateProfile(userId, input) {
  const updates = {}
  for (const field of PROFILE_FIELDS) {
    if (input[field] !== undefined) updates[field] = input[field]
  }

  const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true })
  if (!user) throw unauthorized('User not found')
  return userPayload(user)
}

async function getLeaderboard(currentUserId, limit = 10) {
  const activeStudents = await User.find({ role: 'student', status: 'active' })
    .sort({ totalXP: -1, dsaSolved: -1 })
    .select('name college totalXP')

  const entries = activeStudents.slice(0, limit).map((user, index) => ({
    rank: index + 1,
    id: user._id,
    name: user.name,
    college: user.college,
    xp: user.totalXP || 0,
    isMe: user._id.toString() === currentUserId.toString(),
  }))

  const myRank =
    activeStudents.findIndex(user => user._id.toString() === currentUserId.toString()) + 1

  return { entries, myRank: myRank || null }
}

async function getWeeklyActivity(userId) {
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 6)

  const activity = []

  for (let offset = 0; offset < 7; offset += 1) {
    const dayStart = new Date(start)
    dayStart.setDate(start.getDate() + offset)
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    const [problems, attempts] = await Promise.all([
      Submission.countDocuments({
        user: userId,
        createdAt: { $gte: dayStart, $lte: dayEnd },
      }),
      MockTestAttempt.find(
        { user: userId, createdAt: { $gte: dayStart, $lte: dayEnd } },
        'timeUsed'
      ),
    ])

    const timeHours =
      Math.round((attempts.reduce((sum, attempt) => sum + (attempt.timeUsed || 0), 0) / 60) * 10) /
      10

    activity.push({
      day: dayLabels[dayStart.getDay()],
      problems,
      time: timeHours,
    })
  }

  return activity
}

module.exports = {
  login,
  register,
  signToken,
  userPayload,
  updateProfile,
  getLeaderboard,
  getWeeklyActivity,
}
