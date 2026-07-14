const RoadmapProgress = require('../models/RoadmapProgress')

function listRoadmapProgress(userId) {
  return RoadmapProgress.find({ user: userId }).populate('roadmap').sort({ updatedAt: -1 })
}

function startRoadmap(userId, roadmapId) {
  return RoadmapProgress.findOneAndUpdate(
    { user: userId, roadmap: roadmapId },
    { $setOnInsert: { user: userId, roadmap: roadmapId, startedAt: new Date(), completedTasks: [] } },
    { new: true, upsert: true }
  )
}

async function removeRoadmap(userId, roadmapId) {
  return RoadmapProgress.findOneAndDelete({ user: userId, roadmap: roadmapId })
}

async function toggleRoadmapTask(userId, roadmapId, taskKey) {
  let progress = await RoadmapProgress.findOne({ user: userId, roadmap: roadmapId })
  if (!progress) {
    progress = await RoadmapProgress.create({ user: userId, roadmap: roadmapId, completedTasks: [] })
  }

  const hasTask = progress.completedTasks.includes(taskKey)
  progress.completedTasks = hasTask
    ? progress.completedTasks.filter(task => task !== taskKey)
    : [...progress.completedTasks, taskKey]

  return progress.save()
}

module.exports = {
  listRoadmapProgress,
  removeRoadmap,
  startRoadmap,
  toggleRoadmapTask,
}
