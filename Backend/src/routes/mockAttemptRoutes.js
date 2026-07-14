const express = require('express')
const { createAttempt, listAllAttempts, listMyAttempts } = require('../controllers/mockAttemptController')
const { protect, requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.use(protect)
router.get('/mine', listMyAttempts)
router.post('/', createAttempt)
router.get('/', requireAdmin, listAllAttempts)

module.exports = router
