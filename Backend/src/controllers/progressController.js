const asyncHandler = require('../utils/asyncHandler')
const progressService = require('../services/progressService')
const { sendCreated, sendSuccess } = require('../utils/apiResponse')
const { requireFields } = require('../utils/validation')

const listRoadmapProgress = asyncHandler(async (req, res) => {
  const progress = await progressService.listRoadmapProgress(req.user._id)
  sendSuccess(res, {
    message: 'Roadmap progress loaded',
    data: progress,
    legacy: { items: progress },
  })
})

const startRoadmap = asyncHandler(async (req, res) => {
  const progress = await progressService.startRoadmap(req.user._id, req.params.roadmapId)
  sendCreated(res, {
    message: 'Roadmap started',
    data: progress,
    legacy: progress.toObject ? progress.toObject() : progress,
  })
})

const toggleRoadmapTask = asyncHandler(async (req, res) => {
  requireFields(req.body, ['taskKey'])
  const progress = await progressService.toggleRoadmapTask(req.user._id, req.params.roadmapId, req.body.taskKey)
  sendSuccess(res, {
    message: 'Roadmap task updated',
    data: progress,
    legacy: progress.toObject ? progress.toObject() : progress,
  })
})

const removeRoadmap = asyncHandler(async (req, res) => {
  await progressService.removeRoadmap(req.user._id, req.params.roadmapId)
  sendSuccess(res, {
    message: 'Roadmap progress removed',
    data: { roadmapId: req.params.roadmapId },
  })
})

module.exports = { listRoadmapProgress, removeRoadmap, startRoadmap, toggleRoadmapTask }
