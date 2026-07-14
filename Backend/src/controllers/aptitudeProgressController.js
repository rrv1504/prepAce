const aptitudeProgressService = require('../services/aptitudeProgressService')
const asyncHandler = require('../utils/asyncHandler')
const { sendSuccess } = require('../utils/apiResponse')
const { requireFields } = require('../utils/validation')

const listMine = asyncHandler(async (req, res) => {
  const attempts = await aptitudeProgressService.listMine(req.user._id)
  sendSuccess(res, {
    message: 'Aptitude progress loaded',
    data: attempts,
    legacy: { items: attempts },
  })
})

const submitAnswer = asyncHandler(async (req, res) => {
  requireFields(req.body, ['questionId', 'selected'])
  const result = await aptitudeProgressService.submitAnswer({
    userId: req.user._id,
    questionId: req.body.questionId,
    selected: Number(req.body.selected),
    timeUsed: Number(req.body.timeUsed || 0),
  })

  sendSuccess(res, {
    message: 'Aptitude answer saved',
    data: result,
    legacy: result,
  })
})

module.exports = {
  listMine,
  submitAnswer,
}
