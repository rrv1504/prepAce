const User = require('../models/User')
const { notFound } = require('../utils/appError')

function listUsers(query = {}) {
  const { status, role } = query
  const filter = {}
  if (status) filter.status = status
  if (role) filter.role = role
  return User.find(filter).sort({ createdAt: -1 })
}

async function updateUserStatus(id, status) {
  const user = await User.findByIdAndUpdate(id, { status }, { new: true })
  if (!user) throw notFound('User not found')
  return user
}

async function deleteUser(id) {
  const user = await User.findByIdAndDelete(id)
  if (!user) throw notFound('User not found')
  return user
}

module.exports = {
  deleteUser,
  listUsers,
  updateUserStatus,
}
