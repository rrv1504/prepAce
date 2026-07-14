const asyncHandler = require('../utils/asyncHandler')
const { sendSuccess } = require('../utils/apiResponse')
const aiService = require('../services/aiService')

const generateRoadmap = asyncHandler(async (req, res) => {
  const result = await aiService.generateRoadmap(req.body)
  sendSuccess(res, {
    message: 'Roadmap generated successfully',
    data: result,
    legacy: { source: result.source, roadmap: result.roadmap },
  })
})

const generateQuiz = asyncHandler(async (req, res) => {
  const result = await aiService.generateQuiz(req.body)
  sendSuccess(res, {
    message: 'Quiz generated successfully',
    data: result,
    legacy: { source: result.source, questions: result.questions },
  })
})

module.exports = { generateRoadmap, generateQuiz }
