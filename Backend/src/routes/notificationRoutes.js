const express = require('express')
const {
  createNotification,
  deleteNotification,
  listNotifications,
  updateNotification,
} = require('../controllers/notificationController')
const { protect, requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.use(protect)
router.get('/', listNotifications)
router.post('/', requireAdmin, createNotification)
router.put('/:id', updateNotification)
router.patch('/:id', updateNotification)
router.delete('/:id', requireAdmin, deleteNotification)

module.exports = router
