const express = require('express')
const { listRoadmapProgress, removeRoadmap, startRoadmap, toggleRoadmapTask } = require('../controllers/progressController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.use(protect)
router.get('/roadmaps', listRoadmapProgress)
router.post('/roadmaps/:roadmapId/start', startRoadmap)
router.patch('/roadmaps/:roadmapId/tasks', toggleRoadmapTask)
router.delete('/roadmaps/:roadmapId', removeRoadmap)

module.exports = router
