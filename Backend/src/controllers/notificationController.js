const Notification = require('../models/Notification')
const asyncHandler = require('../utils/asyncHandler')
const { sendCreated, sendSuccess } = require('../utils/apiResponse')
const { requireFields } = require('../utils/validation')

const listNotifications = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin'
    ? {}
    : { $or: [{ user: req.user._id }, { user: { $exists: false } }, { user: null }] }
  const items = await Notification.find(filter).sort({ createdAt: -1 })
  sendSuccess(res, { message: 'Notifications loaded', data: items, legacy: { items } })
})

const createNotification = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'body'])
  const notification = await Notification.create(req.body)
  sendCreated(res, {
    message: 'Notification created',
    data: notification,
    legacy: notification.toObject ? notification.toObject() : notification,
  })
})

const updateNotification = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, $or: [{ user: req.user._id }, { user: { $exists: false } }, { user: null }] }
  const notification = await Notification.findOneAndUpdate(filter, req.body, { new: true, runValidators: true })
  sendSuccess(res, {
    message: 'Notification updated',
    data: notification,
    legacy: notification?.toObject ? notification.toObject() : notification,
  })
})

const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id)
  sendSuccess(res, { message: 'Notification deleted', data: { id: req.params.id } })
})

module.exports = {
  createNotification,
  deleteNotification,
  listNotifications,
  updateNotification,
}
