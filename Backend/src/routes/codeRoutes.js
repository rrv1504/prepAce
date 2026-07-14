const express = require('express')
const { judgeCode, runCode } = require('../controllers/codeController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.post('/run', runCode)
router.post('/judge', protect, judgeCode)

module.exports = router
