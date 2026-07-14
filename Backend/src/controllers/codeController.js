const asyncHandler = require('../utils/asyncHandler')
const codeExecutionService = require('../services/codeExecutionService')
const { sendSuccess } = require('../utils/apiResponse')
const { requireNonEmptyArray } = require('../utils/validation')

const runCode = asyncHandler(async (req, res) => {
  const result = await codeExecutionService.runCode(req.body)
  console.log('Code executed successfully:', result)
  sendSuccess(res, {
    message: 'Code executed',
    data: result,
    legacy: {
      ...result,
      // Backward-compatible convenience field used by older clients.
      success: true,
    },
  })

  
})

const judgeCode = asyncHandler(async (req, res) => {
  requireNonEmptyArray(req.body.testCases, 'testCases')
  const result = await codeExecutionService.judgeCode({
    ...req.body,
    user: req.user,
  })
  sendSuccess(res, {
    message: 'Code judged',
    data: result,
    legacy: {
      ...result,
      success: true,
    },
  })
})

module.exports = { judgeCode, runCode }
