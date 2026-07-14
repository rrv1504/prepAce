const asyncHandler = require('../utils/asyncHandler')
const codeExecutionService = require('../services/codeExecutionService')
const { isJudgeProxyEnabled, proxyCodeRequest } = require('../services/judgeProxyService')
const { sendSuccess } = require('../utils/apiResponse')
const { requireNonEmptyArray } = require('../utils/validation')

const runCode = asyncHandler(async (req, res) => {
  const result = isJudgeProxyEnabled()
    ? await proxyCodeRequest({
        path: '/code/run',
        body: req.body,
        authorization: req.headers.authorization,
      })
    : await codeExecutionService.runCode(req.body)

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
  const result = isJudgeProxyEnabled()
    ? await proxyCodeRequest({
        path: '/code/judge',
        body: req.body,
        authorization: req.headers.authorization,
      })
    : await codeExecutionService.judgeCode({
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
