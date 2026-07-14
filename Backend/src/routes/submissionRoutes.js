const express = require('express')
const { createSubmission, listSubmissions } = require('../controllers/submissionController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.use(protect)
router.get('/', listSubmissions)
router.post('/', createSubmission)

module.exports = router
