const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    type: { type: String, default: 'info' },
    icon: { type: String, default: 'AlertCircle' },
    iconColor: { type: String, default: '#6366f1' },
    time: { type: String },
    read: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

notificationSchema.index({ user: 1, read: 1, createdAt: -1 })
notificationSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)
