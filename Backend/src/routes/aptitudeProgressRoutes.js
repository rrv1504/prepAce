const express = require('express')
const { listMine, submitAnswer } = require('../controllers/aptitudeProgressController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.use(protect)
router.get('/mine', listMine)
router.post('/', submitAnswer)

module.exports = router
