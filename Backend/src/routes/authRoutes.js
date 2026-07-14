const express = require('express')
const { login, me, register, updateMe, leaderboard, weeklyActivity } = require('../controllers/authController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, me)
router.patch('/me', protect, updateMe)
router.get('/leaderboard', protect, leaderboard)
router.get('/weekly-activity', protect, weeklyActivity)

module.exports = router
