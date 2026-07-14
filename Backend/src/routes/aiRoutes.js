const express = require('express')
const { generateQuiz, generateRoadmap } = require('../controllers/aiController')
const { protect, requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.post('/roadmap', protect, requireAdmin, generateRoadmap)
router.post('/quiz', protect, generateQuiz)

module.exports = router
