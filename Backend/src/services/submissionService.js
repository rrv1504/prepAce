const Submission = require('../models/Submission')
const { refreshDsaProgress } = require('./dsaProgressService')

function listSubmissions(user) {
  const filter = user.role === 'admin' ? {} : { user: user._id }
  return Submission.find(filter)
    .populate('problem', 'title difficulty topic')
    .sort({ createdAt: -1 })
}

async function createSubmission(userId, data) {
  const submission = await Submission.create({
    ...data,
    user: userId,
  })
  await refreshDsaProgress(userId, data.problem)
  return submission
}

module.exports = {
  createSubmission,
  listSubmissions,
}
