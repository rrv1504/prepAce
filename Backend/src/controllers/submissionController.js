const asyncHandler = require('../utils/asyncHandler')
const submissionService = require('../services/submissionService')
const { sendCreated, sendSuccess } = require('../utils/apiResponse')
const { requireFields } = require('../utils/validation')

const listSubmissions = asyncHandler(async (req, res) => {
  const submissions = await submissionService.listSubmissions(req.user)
  sendSuccess(res, {
    message: 'Submissions loaded',
    data: submissions,
    legacy: { items: submissions },
  })
})

const createSubmission = asyncHandler(async (req, res) => {
  requireFields(req.body, ['problem', 'lang', 'code', 'verdict'])
  const submission = await submissionService.createSubmission(req.user._id, req.body)
  sendCreated(res, {
    message: 'Submission saved',
    data: submission,
    legacy: submission.toObject ? submission.toObject() : submission,
  })
})

module.exports = { createSubmission, listSubmissions }
