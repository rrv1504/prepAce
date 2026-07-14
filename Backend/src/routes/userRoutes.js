const express = require('express')
const { deleteUser, listUsers, updateUserStatus } = require('../controllers/userController')
const { protect, requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.use(protect, requireAdmin)

router.get('/', listUsers)
router.patch('/:id/status', updateUserStatus)
router.delete('/:id', deleteUser)

module.exports = router
