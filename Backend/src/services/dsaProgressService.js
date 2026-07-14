const DSAProblem = require('../models/DSAProblem')
const Badge = require('../models/Badge')
const Notification = require('../models/Notification')
const Submission = require('../models/Submission')
const User = require('../models/User')

async function awardBadgeIfEligible(user, acceptedCount) {
  const targets = [
    { count: 1, name: 'First Solve' },
    { count: 10, name: 'DSA Starter' },
    { count: 50, name: 'DSA Hero' },
  ]
  const target = targets.find(item => acceptedCount >= item.count)
  if (!target) return

  const badge = await Badge.findOne({ name: target.name })
  if (!badge || user.badges?.some(id => String(id) === String(badge._id))) return

  user.badges = [...(user.badges || []), badge._id]
  user.totalXP = (user.totalXP || 0) + (badge.xp || 0)
  await Notification.create({
    user: user._id,
    title: 'New badge unlocked',
    body: `You earned the ${badge.name} badge.`,
    type: 'badge',
    icon: 'Trophy',
    iconColor: badge.color || '#f59e0b',
  })
}

async function refreshDsaProgress(userId, problemId) {
  if (problemId) {
    const [submissions, accepted] = await Promise.all([
      Submission.countDocuments({ problem: problemId }),
      Submission.countDocuments({ problem: problemId, verdict: 'Accepted' }),
    ])
    await DSAProblem.findByIdAndUpdate(problemId, { submissions, accepted })
  }

  const acceptedProblemIds = await Submission.distinct('problem', {
    user: userId,
    verdict: 'Accepted',
  })
  const attemptedProblemIds = await Submission.distinct('problem', { user: userId })
  const acceptedTopics = await DSAProblem.find({ _id: { $in: acceptedProblemIds } }).distinct('topic')

  const user = await User.findById(userId)
  if (!user) return

  user.dsaSolved = acceptedProblemIds.length
  user.totalXP = acceptedProblemIds.length * 25 + Math.max(0, attemptedProblemIds.length - acceptedProblemIds.length) * 5
  user.strongTopics = acceptedTopics.slice(0, 5)
  user.lastActive = new Date()
  await awardBadgeIfEligible(user, acceptedProblemIds.length)
  await user.save()
}

module.exports = {
  refreshDsaProgress,
}
