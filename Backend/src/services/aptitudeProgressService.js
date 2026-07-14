const AptitudeAttempt = require('../models/AptitudeAttempt')
const AptitudeQuestion = require('../models/AptitudeQuestion')
const User = require('../models/User')
const { notFound } = require('../utils/appError')

async function refreshQuestionStats(questionId) {
  const [attempts, correct] = await Promise.all([
    AptitudeAttempt.countDocuments({ question: questionId }),
    AptitudeAttempt.countDocuments({ question: questionId, correct: true }),
  ])

  const correctRate = attempts ? Math.round((correct / attempts) * 100) : 0
  await AptitudeQuestion.findByIdAndUpdate(questionId, { attempts, correctRate })
  return { attempts, correctRate }
}

async function refreshUserStats(userId) {
  const attempts = await AptitudeAttempt.find({ user: userId })
  const total = attempts.length
  const correct = attempts.filter(attempt => attempt.correct).length
  const aptitudeScore = total ? Math.round((correct / total) * 100) : 0

  await User.findByIdAndUpdate(userId, {
    aptitudeScore,
    aptitudeTests: total,
    lastActive: new Date(),
  })

  return { total, correct, aptitudeScore }
}

async function submitAnswer({ userId, questionId, selected, timeUsed = 0 }) {
  const question = await AptitudeQuestion.findById(questionId)
  if (!question) throw notFound('Aptitude question not found')

  const correct = Number(selected) === Number(question.correct)
  const attempt = await AptitudeAttempt.findOneAndUpdate(
    { user: userId, question: questionId },
    { selected, correct, timeUsed },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  const [questionStats, userStats] = await Promise.all([
    refreshQuestionStats(questionId),
    refreshUserStats(userId),
  ])

  return {
    attempt,
    questionStats,
    userStats,
    correctAnswer: question.correct,
    explanation: question.explanation,
  }
}

function listMine(userId) {
  return AptitudeAttempt.find({ user: userId }).sort({ updatedAt: -1 })
}

module.exports = {
  listMine,
  submitAnswer,
}
