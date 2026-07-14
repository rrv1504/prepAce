const MockTestAttempt = require('../models/MockTestAttempt')
const User = require('../models/User')

function listMyAttempts(userId) {
  return MockTestAttempt.find({ user: userId }).sort({ createdAt: -1 })
}

async function createAttempt(userId, data) {
  const totalMarks = Number(data.totalMarks || 0)
  const score = Number(data.score || 0)
  const percentage = data.percentage !== undefined
    ? Number(data.percentage)
    : totalMarks > 0
      ? Math.round((score / totalMarks) * 100)
      : 0

  const attempt = await MockTestAttempt.create({
    ...data,
    score,
    totalMarks,
    percentage,
    timeUsed: Number(data.timeUsed || 0),
    testTitle: data.testTitle || data.title || 'Mock Test',
    user: userId,
  })
  await User.findByIdAndUpdate(userId, {
    $inc: { mockTestsTaken: 1 },
    $set: { lastActive: new Date() },
  })
  return attempt
}

function listAllAttempts() {
  return MockTestAttempt.find({})
    .populate('user', 'name email college branch year')
    .sort({ createdAt: -1 })
}

module.exports = {
  createAttempt,
  listAllAttempts,
  listMyAttempts,
}
