const asyncHandler = require('../utils/asyncHandler')
const mockTestService = require('../services/mockTestService')
const { sendCreated, sendSuccess } = require('../utils/apiResponse')
const { requireFields } = require('../utils/validation')

const listMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await mockTestService.listMyAttempts(req.user._id)
  sendSuccess(res, {
    message: 'Mock test attempts loaded',
    data: attempts,
    legacy: { items: attempts },
  })
})

const createAttempt = asyncHandler(async (req, res) => {
  requireFields(req.body, ['testTitle'])
  const attempt = await mockTestService.createAttempt(req.user._id, req.body)
  sendCreated(res, {
    message: 'Mock test attempt saved',
    data: attempt,
    legacy: attempt.toObject ? attempt.toObject() : attempt,
  })
})

const listAllAttempts = asyncHandler(async (req, res) => {
  const attempts = await mockTestService.listAllAttempts()
  sendSuccess(res, {
    message: 'All mock test attempts loaded',
    data: attempts,
    legacy: { items: attempts },
  })
})

module.exports = { createAttempt, listAllAttempts, listMyAttempts }
